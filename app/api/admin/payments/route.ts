import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-client'
import { sendFinancialNotification } from '@/lib/notifications'

export async function POST(request: NextRequest) {
  try {
    const requestBody = await request.json()
    console.log('POST /api/admin/payments - Request body:', requestBody)
    
    const { 
      student_id, 
      amount, 
      payment_method, 
      reference_number, 
      semester,
      payment_date,
      notes 
    } = requestBody

    if (!student_id || !amount || amount <= 0) {
      return NextResponse.json({ 
        error: 'Missing required fields', 
        required: { student_id: 'number', amount: 'positive number' }
      }, { status: 400 })
    }

    // Begin a transaction
    // First, insert payment record
    const { data: payment, error: paymentError } = await supabase
      .from('fee_payments')
      .insert({
        student_id,
        amount,
        payment_method: payment_method || 'other',
        reference_number: reference_number || '',
        payment_date: payment_date || new Date().toISOString(),
        semester: semester || null,
        notes: notes || '',
      })
      .select()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }
    
    // Get all payments for the student to calculate total paid amount
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from('fee_payments')
      .select('amount')
      .eq('student_id', student_id)

    if (allPaymentsError) {
      console.error('Error fetching all payments:', allPaymentsError)
      // Continue despite error - we don't want to rollback the payment
    }
    
    // Calculate total paid amount
    const totalPaid = allPayments?.reduce(
      (sum, payment) => sum + parseFloat(payment.amount.toString()), 0
    ) || 0
    
    // Get fees for this student
    const { data: fees, error: feesError } = await supabase
      .from('fees')
      .select('*')
      .eq('student_id', student_id)
      .order('semester', { ascending: false })
    
    if (!feesError && fees && fees.length > 0) {
      // Update amount_paid in fees table (most recent semester first)
      if (semester) {
        // Update specific semester if provided
        await supabase
          .from('fees')
          .update({ amount_paid: totalPaid })
          .eq('student_id', student_id)
          .eq('semester', semester)
      } else {
        // Otherwise update the most recent semester
        await supabase
          .from('fees')
          .update({ amount_paid: totalPaid })
          .eq('id', fees[0].id)
      }
    }
    
    // Send notification to the student
    await sendFinancialNotification(
      student_id,
      'Payment Received',
      `A payment of KES ${amount.toLocaleString()} has been recorded to your account.`,
      'payment_received'
    )
    
    return NextResponse.json({ 
      success: true, 
      message: 'Payment recorded successfully',
      data: payment
    })
  } catch (error) {
    console.error('Error in payment API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const student_id = searchParams.get('student_id')
    const semester = searchParams.get('semester')

    let query = supabase
      .from('fee_payments')
      .select(`
        *,
        students!inner(
          id,
          name,
          registration_number,
          course
        )
      `)
      .order('payment_date', { ascending: false })

    if (student_id) {
      query = query.eq('student_id', student_id)
    }

    if (semester) {
      query = query.eq('semester', semester)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching payments:', error)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in payments API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
