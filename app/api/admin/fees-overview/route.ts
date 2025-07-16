import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    // Get all students
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('id, name, registration_number, course')
      .order('name')

    if (studentsError) {
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    // Get all fees
    const { data: fees } = await supabaseAdmin
      .from('fees')
      .select('student_id, semester_fee, total_paid, fee_balance')
    
    // Get all payments
    const { data: payments } = await supabaseAdmin
      .from('fee_payments')
      .select('student_id, amount')
    
    // Calculate totals and format data
    const feesOverview = students?.map(student => {
      const studentFees = fees?.filter(f => f.student_id === student.id) || []
      const totalBilled = studentFees.reduce((sum, fee) => sum + (fee.semester_fee || 0), 0)
      const feesPaid = studentFees.reduce((sum, fee) => sum + (fee.total_paid || 0), 0)
      const paymentsPaid = payments?.filter(p => p.student_id === student.id).reduce((sum, p) => sum + p.amount, 0) || 0
      const totalPaid = Math.max(feesPaid, paymentsPaid)
      const totalBalance = totalBilled - totalPaid

      return {
        student_id: student.id,
        name: student.name,
        registration_number: student.registration_number,
        course: student.course,
        total_billed: totalBilled,
        total_paid: totalPaid,
        outstanding_balance: totalBalance,
        payment_status: totalBalance <= 0 ? 'Paid' : 'Outstanding'
      }
    }) || []

    // Calculate summary statistics
    const summary = {
      total_students: feesOverview.length,
      total_billed: feesOverview.reduce((sum, student) => sum + student.total_billed, 0),
      total_collected: feesOverview.reduce((sum, student) => sum + student.total_paid, 0),
      total_outstanding: feesOverview.reduce((sum, student) => sum + student.outstanding_balance, 0),
      students_paid: feesOverview.filter(s => s.payment_status === 'Paid').length,
      students_outstanding: feesOverview.filter(s => s.payment_status === 'Outstanding').length
    }

    return NextResponse.json({
      success: true,
      data: {
        students: feesOverview,
        summary
      }
    })
  } catch (error) {
    console.error('Error fetching fees overview:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}