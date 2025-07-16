import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { student_id, registration_number, amount, payment_method, reference_number, notes } = await request.json()

    if ((!student_id && !registration_number) || !amount) {
      return NextResponse.json({ error: 'Student ID/Registration number and amount required' }, { status: 400 })
    }

    let studentId = student_id
    
    // If registration number provided, get student ID
    if (!studentId && registration_number) {
      const { data: student } = await supabaseAdmin
        .from('students')
        .select('id')
        .eq('registration_number', registration_number)
        .single()
      
      if (!student) {
        return NextResponse.json({ error: 'Student not found' }, { status: 404 })
      }
      
      studentId = student.id
    }

    // Record payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('fee_payments')
      .insert({
        student_id: studentId,
        amount,
        payment_method: payment_method || 'Cash',
        reference_number,
        notes,
        payment_date: new Date().toISOString()
      })
      .select()
      .single()

    if (paymentError) {
      return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
    }

    // Update fee balance
    const { data: fees } = await supabaseAdmin
      .from('fees')
      .select('*')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (fees && fees.length > 0) {
      let remainingAmount = amount
      
      for (const fee of fees) {
        if (remainingAmount <= 0) break
        
        const currentBalance = fee.fee_balance || 0
        const paymentForThisFee = Math.min(remainingAmount, currentBalance)
        const newAmountPaid = (fee.total_paid || 0) + paymentForThisFee
        const newBalance = (fee.semester_fee || 0) - newAmountPaid
        const newProgress = fee.semester_fee > 0 ? Math.round((newAmountPaid / fee.semester_fee) * 100) : 0
        
        const { error: updateError } = await supabaseAdmin
          .from('fees')
          .update({
            total_paid: newAmountPaid,
            fee_balance: Math.max(0, newBalance),
            session_progress: newProgress,
            updated_at: new Date().toISOString()
          })
          .eq('id', fee.id)
        
        if (updateError) {
          console.error('Error updating fee record:', updateError)
        }
        
        remainingAmount -= paymentForThisFee
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: payment,
      message: 'Payment recorded and balances updated successfully'
    })
  } catch (error) {
    console.error('Payment recording error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}