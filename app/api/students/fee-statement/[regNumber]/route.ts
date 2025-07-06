import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ regNumber: string }> }
) {
  try {
    const { regNumber } = await context.params

    if (!regNumber) {
      return NextResponse.json({ error: 'Registration number is required' }, { status: 400 })
    }

    // Get student information
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        registration_number,
        name,
        email,
        phone,
        course,
        year_of_study,
        semester,
        created_at
      `)
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get fee information
    const { data: fees, error: feesError } = await supabaseAdmin
      .from('fees')
      .select(`
        *,
        academic_year,
        semester,
        tuition_fee,
        exam_fee,
        library_fee,
        lab_fee,
        activity_fee,
        total_fee,
        amount_paid,
        created_at,
        updated_at
      `)
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (feesError) {
      console.error('Error fetching fees:', feesError)
      return NextResponse.json({ error: 'Failed to fetch fee information' }, { status: 500 })
    }

    // Get payment history
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select(`
        *,
        amount,
        payment_method,
        reference_number,
        payment_date,
        notes,
        created_at
      `)
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false })

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 })
    }

    // Calculate totals
    const totalBilled = fees?.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0) || 0
    const totalPaid = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) || 0
    const balance = totalBilled - totalPaid

    // Get current semester fee details
    const currentSemesterFee = fees && fees.length > 0 ? fees[0] : null

    const feeStatement = {
      student: {
        id: student.id,
        registration_number: student.registration_number,
        name: student.name,
        email: student.email,
        phone: student.phone,
        course: student.course,
        year_of_study: student.year_of_study,
        semester: student.semester
      },
      financial_summary: {
        total_billed: totalBilled,
        total_paid: totalPaid,
        balance: balance,
        payment_progress: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0
      },
      current_semester: currentSemesterFee ? {
        academic_year: currentSemesterFee.academic_year,
        semester: currentSemesterFee.semester,
        tuition_fee: parseFloat(currentSemesterFee.tuition_fee.toString()),
        exam_fee: parseFloat(currentSemesterFee.exam_fee.toString()),
        library_fee: parseFloat(currentSemesterFee.library_fee.toString()),
        lab_fee: parseFloat(currentSemesterFee.lab_fee.toString()),
        activity_fee: parseFloat(currentSemesterFee.activity_fee.toString()),
        total_fee: parseFloat(currentSemesterFee.total_fee.toString()),
        amount_paid: parseFloat(currentSemesterFee.amount_paid.toString()),
        balance: parseFloat(currentSemesterFee.total_fee.toString()) - parseFloat(currentSemesterFee.amount_paid.toString())
      } : null,
      fee_history: fees?.map(fee => ({
        id: fee.id,
        academic_year: fee.academic_year,
        semester: fee.semester,
        tuition_fee: parseFloat(fee.tuition_fee.toString()),
        exam_fee: parseFloat(fee.exam_fee.toString()),
        library_fee: parseFloat(fee.library_fee.toString()),
        lab_fee: parseFloat(fee.lab_fee.toString()),
        activity_fee: parseFloat(fee.activity_fee.toString()),
        total_fee: parseFloat(fee.total_fee.toString()),
        amount_paid: parseFloat(fee.amount_paid.toString()),
        balance: parseFloat(fee.total_fee.toString()) - parseFloat(fee.amount_paid.toString()),
        created_at: fee.created_at,
        updated_at: fee.updated_at
      })) || [],
      payment_history: payments?.map(payment => ({
        id: payment.id,
        amount: parseFloat(payment.amount.toString()),
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        payment_date: payment.payment_date,
        notes: payment.notes,
        created_at: payment.created_at
      })) || [],
      generated_at: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: feeStatement })
  } catch (error) {
    console.error('Error in fee statement API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
