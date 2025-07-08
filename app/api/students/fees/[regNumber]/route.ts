import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'
export async function GET(request: NextRequest, { params }: { params: Promise<{ regNumber: string }> | { regNumber: string } }) {
  try {
    const { regNumber } = 'then' in params ? await params : params

    // Get student ID from registration number
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get fees for the student
    const { data: fees, error: feesError } = await supabaseAdmin
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (feesError) {
      return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
    }

    // Get payments for the student
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select('*')
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false })

    if (paymentsError) {
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }
    
    // Calculate total billed and total paid
    const totalBilled = fees?.reduce((sum, fee) => sum + parseFloat(fee.total_billed?.toString() || fee.total_fee?.toString() || '0'), 0) || 0
    const totalPaid = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount?.toString() || '0'), 0) || 0
    const feeBalance = totalBilled - totalPaid
    
    // Get current semester fee (most recent)
    const currentSemesterFee = fees && fees.length > 0 ? fees[0] : null
    const semesterFee = currentSemesterFee ? parseFloat(currentSemesterFee.total_billed?.toString() || currentSemesterFee.total_fee?.toString() || '0') : 0
    
    // Format response to match what the frontend expects
    const responseData = {
      fees: fees?.map(fee => ({
        ...fee,
        total_fee: parseFloat(fee.total_billed?.toString() || fee.total_fee?.toString() || '0'),
        amount_paid: parseFloat(fee.total_paid?.toString() || fee.amount_paid?.toString() || '0'),
        balance: parseFloat(fee.total_billed?.toString() || fee.total_fee?.toString() || '0') - parseFloat(fee.total_paid?.toString() || fee.amount_paid?.toString() || '0')
      })),
      payments,
      total_billed: totalBilled,
      total_paid: totalPaid,
      fee_balance: feeBalance,
      semester_fee: semesterFee,
      session_progress: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0
    }

    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
