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
      .select('id')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get the most recent fee record for the student
    const { data: latestFee, error: feeError } = await supabaseAdmin
      .from('fees')
      .select('id, total_fee, amount_paid, created_at')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (feeError || !latestFee) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
    }

    const total_billed = parseFloat(latestFee.total_fee || 0)
    const total_paid = parseFloat(latestFee.amount_paid || 0)
    const balance = total_billed - total_paid

    return NextResponse.json({
      success: true,
      data: {
        total_billed,
        total_paid,
        balance,
        latest_fee_id: latestFee.id,
        created_at: latestFee.created_at
      }
    })
  } catch (error) {
    console.error('Error in finance dashboard API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
