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
        course,
        year_of_study,
        semester,
        status
      `)
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get current semester fee information
    const { data: fees, error: feesError } = await supabaseAdmin
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (feesError) {
      console.error('Error fetching fees:', feesError)
      return NextResponse.json({ error: 'Failed to fetch fee information' }, { status: 500 })
    }

    // Get all payments for the student
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select('*')
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false })

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payment information' }, { status: 500 })
    }

    // Calculate financial summary
    const currentFee = fees && fees.length > 0 ? fees[0] : null
    const totalBilled = currentFee ? parseFloat(currentFee.total_fee.toString()) : 0
    const totalPaid = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) || 0
    const balance = totalBilled - totalPaid
    const paymentProgress = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0

    // Determine payment status
    let paymentStatus = 'pending'
    let statusColor = 'warning'
    let statusMessage = 'Payment pending'

    if (balance <= 0) {
      paymentStatus = 'paid'
      statusColor = 'success'
      statusMessage = 'Fully paid'
    } else if (totalPaid > 0) {
      paymentStatus = 'partial'
      statusColor = 'info'
      statusMessage = 'Partially paid'
    } else {
      paymentStatus = 'unpaid'
      statusColor = 'error'
      statusMessage = 'Not paid'
    }

    // Check if student can access exam card (paid at least 60% of fees)
    const canAccessExamCard = paymentProgress >= 60

    // Get recent payment activity (last 3 payments)
    const recentPayments = payments?.slice(0, 3) || []

    // Calculate payment deadline (assuming 30 days from fee creation)
    const paymentDeadline = currentFee 
      ? new Date(new Date(currentFee.created_at).getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
      : null

    // Check if payment is overdue
    const isOverdue = paymentDeadline && new Date() > new Date(paymentDeadline) && balance > 0

    const financeOverview = {
      student: {
        id: student.id,
        registration_number: student.registration_number,
        name: student.name,
        course: student.course,
        year_of_study: student.year_of_study,
        semester: student.semester,
        status: student.status
      },
      financial_summary: {
        total_billed: totalBilled,
        total_paid: totalPaid,
        balance: balance,
        payment_progress: paymentProgress,
        payment_status: paymentStatus,
        status_color: statusColor,
        status_message: statusMessage,
        is_overdue: isOverdue,
        payment_deadline: paymentDeadline,
        can_access_exam_card: canAccessExamCard
      },
      current_semester: currentFee ? {
        id: currentFee.id,
        academic_year: currentFee.academic_year,
        semester: currentFee.semester,
        tuition_fee: parseFloat(currentFee.tuition_fee.toString()),
        exam_fee: parseFloat(currentFee.exam_fee.toString()),
        library_fee: parseFloat(currentFee.library_fee.toString()),
        lab_fee: parseFloat(currentFee.lab_fee.toString()),
        activity_fee: parseFloat(currentFee.activity_fee.toString()),
        total_fee: parseFloat(currentFee.total_fee.toString()),
        amount_paid: parseFloat(currentFee.amount_paid.toString()),
        balance: parseFloat(currentFee.total_fee.toString()) - parseFloat(currentFee.amount_paid.toString()),
        created_at: currentFee.created_at,
        updated_at: currentFee.updated_at
      } : null,
      recent_payments: recentPayments.map(payment => ({
        id: payment.id,
        amount: parseFloat(payment.amount.toString()),
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        payment_date: payment.payment_date,
        notes: payment.notes
      })),
      payment_statistics: {
        total_payments: payments?.length || 0,
        average_payment: payments && payments.length > 0 
          ? totalPaid / payments.length 
          : 0,
        last_payment_date: payments && payments.length > 0 
          ? payments[0].payment_date 
          : null,
        payment_methods_used: [...new Set(payments?.map(p => p.payment_method) || [])],
        months_with_payments: [...new Set(payments?.map(p => 
          new Date(p.payment_date).toISOString().slice(0, 7)
        ) || [])]
      },
      quick_actions: {
        can_make_payment: balance > 0,
        can_view_statement: true,
        can_download_receipt: payments && payments.length > 0,
        can_access_exam_card: canAccessExamCard,
        payment_reminder: isOverdue
      },
      generated_at: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: financeOverview })
  } catch (error) {
    console.error('Error in finance overview API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
