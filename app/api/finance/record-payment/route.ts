import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { registration_number, amount, payment_method, reference_number, notes } = await request.json()

    if (!registration_number || !amount) {
      return NextResponse.json({ error: 'Registration number and amount are required' }, { status: 400 })
    }

    // Get student ID from registration number
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('registration_number', registration_number)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Record the payment
    const { data: payment, error: paymentError } = await supabase
      .from('fee_payments')
      .insert({
        student_id: student.id,
        amount: parseFloat(amount),
        payment_method: payment_method || 'cash',
        reference_number: reference_number || null,
        notes: notes || null,
        payment_date: new Date().toISOString()
      })
      .select()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    // Update the amount_paid in fees table
    const { data: fees, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

    if (feesError) {
      console.error('Error fetching fees for update:', feesError)
      return NextResponse.json({ error: 'Failed to update fee records' }, { status: 500 })
    }

    // Get total payments for this student
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from('fee_payments')
      .select('amount')
      .eq('student_id', student.id)

    if (allPaymentsError) {
      console.error('Error fetching all payments:', allPaymentsError)
      return NextResponse.json({ error: 'Failed to calculate total payments' }, { status: 500 })
    }

    const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0)

    // Update the most recent fee record with the new total paid amount
    if (fees && fees.length > 0) {
      const { error: updateError } = await supabase
        .from('fees')
        .update({ 
          amount_paid: totalPaid,
          updated_at: new Date().toISOString()
        })
        .eq('id', fees[0].id)

      if (updateError) {
        console.error('Error updating fee record:', updateError)
        return NextResponse.json({ error: 'Failed to update fee record' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { 
        payment, 
        total_paid: totalPaid,
        message: 'Payment recorded successfully' 
      } 
    })
  } catch (error) {
    console.error('Error in payment recording API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
