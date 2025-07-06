import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { 
      registration_number, 
      amount, 
      payment_method, 
      reference_number, 
      notes,
      student_initiated = true 
    } = await request.json()

    if (!registration_number || !amount || !payment_method) {
      return NextResponse.json({ 
        error: 'Registration number, amount, and payment method are required' 
      }, { status: 400 })
    }

    // Validate amount
    const paymentAmount = parseFloat(amount)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      return NextResponse.json({ 
        error: 'Invalid payment amount' 
      }, { status: 400 })
    }

    // Get student information
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, name, registration_number, email, phone')
      .eq('registration_number', registration_number)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get current fee information to validate payment
    const { data: currentFee, error: feeError } = await supabaseAdmin
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (feeError) {
      console.error('Error fetching current fee:', feeError)
      return NextResponse.json({ error: 'Failed to fetch fee information' }, { status: 500 })
    }

    // Calculate current balance
    const { data: existingPayments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select('amount')
      .eq('student_id', student.id)

    if (paymentsError) {
      console.error('Error fetching existing payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 })
    }

    const totalPaid = existingPayments?.reduce((sum, payment) => 
      sum + parseFloat(payment.amount.toString()), 0
    ) || 0

    const totalBilled = currentFee && currentFee.length > 0 
      ? parseFloat(currentFee[0].total_fee.toString()) 
      : 0

    const currentBalance = totalBilled - totalPaid

    // Validate payment amount doesn't exceed balance
    if (paymentAmount > currentBalance) {
      return NextResponse.json({ 
        error: `Payment amount (${paymentAmount}) exceeds outstanding balance (${currentBalance})` 
      }, { status: 400 })
    }

    // Check for duplicate reference number
    if (reference_number) {
      const { data: existingPayment, error: duplicateError } = await supabaseAdmin
        .from('fee_payments')
        .select('id')
        .eq('reference_number', reference_number)
        .single()

      if (existingPayment && !duplicateError) {
        return NextResponse.json({ 
          error: 'A payment with this reference number already exists' 
        }, { status: 400 })
      }
    }

    // Record the payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('fee_payments')
      .insert({
        student_id: student.id,
        amount: paymentAmount,
        payment_method: payment_method,
        reference_number: reference_number || null,
        notes: notes || null,
        payment_date: new Date().toISOString(),
        student_initiated: student_initiated,
        status: student_initiated ? 'pending' : 'confirmed' // Student payments might need admin approval
      })
      .select()
      .single()

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    // Update the amount_paid in the fees table
    if (currentFee && currentFee.length > 0) {
      const newAmountPaid = parseFloat(currentFee[0].amount_paid.toString()) + paymentAmount

      const { error: updateError } = await supabaseAdmin
        .from('fees')
        .update({ 
          amount_paid: newAmountPaid,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentFee[0].id)

      if (updateError) {
        console.error('Error updating fee record:', updateError)
        // Don't fail the request, just log the error
      }
    }

    // Calculate new balance and payment progress
    const newBalance = currentBalance - paymentAmount
    const paymentProgress = totalBilled > 0 
      ? Math.round(((totalPaid + paymentAmount) / totalBilled) * 100) 
      : 0

    // Determine new payment status
    let paymentStatus = 'partial'
    let statusMessage = 'Payment recorded successfully'

    if (newBalance <= 0) {
      paymentStatus = 'paid'
      statusMessage = 'Congratulations! Your fees are now fully paid'
    } else if (paymentProgress >= 60) {
      statusMessage = 'Payment recorded. You can now access your exam card'
    }

    const paymentResult = {
      payment: {
        id: payment.id,
        student_id: student.id,
        amount: paymentAmount,
        payment_method: payment_method,
        reference_number: reference_number,
        payment_date: payment.payment_date,
        notes: notes,
        status: payment.status,
        student_initiated: student_initiated
      },
      student: {
        id: student.id,
        name: student.name,
        registration_number: student.registration_number,
        email: student.email,
        phone: student.phone
      },
      financial_summary: {
        previous_balance: currentBalance,
        payment_amount: paymentAmount,
        new_balance: newBalance,
        total_paid: totalPaid + paymentAmount,
        total_billed: totalBilled,
        payment_progress: paymentProgress,
        payment_status: paymentStatus,
        can_access_exam_card: paymentProgress >= 60
      },
      message: statusMessage,
      next_steps: [
        newBalance > 0 ? 'You can make additional payments to clear your balance' : null,
        paymentProgress >= 60 ? 'You can now download your exam card' : null,
        student_initiated ? 'Your payment is pending admin approval' : null
      ].filter(Boolean),
      created_at: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      message: statusMessage,
      data: paymentResult 
    })

  } catch (error) {
    console.error('Error in make payment API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
