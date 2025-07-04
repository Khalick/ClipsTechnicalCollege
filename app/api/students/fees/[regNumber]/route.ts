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

    // First, get the student ID from registration number
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get fee information for the student
    const { data: fees, error: feesError } = await supabaseAdmin
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (feesError) {
      console.error('Error fetching fees:', feesError)
      return NextResponse.json({ error: 'Failed to fetch fee information' }, { status: 500 })
    }

    // Get total payments for the student
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select('amount')
      .eq('student_id', student.id)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payment information' }, { status: 500 })
    }

    // Calculate totals
    const totalBilled = fees?.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0) || 0
    const totalPaid = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) || 0
    const balance = totalBilled - totalPaid

    // Calculate session progress (percentage of fees paid)
    const sessionProgress = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0

    // Get current semester fee (most recent)
    const currentSemesterFee = fees && fees.length > 0 ? parseFloat(fees[0].total_fee.toString()) : 0

    const feeData = {
      fee_balance: balance,
      total_paid: totalPaid,
      semester_fee: currentSemesterFee,
      session_progress: sessionProgress,
      fees: fees || [],
      payments: payments || []
    }

    return NextResponse.json({ success: true, data: feeData })
  } catch (error) {
    console.error('Error in fees API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
