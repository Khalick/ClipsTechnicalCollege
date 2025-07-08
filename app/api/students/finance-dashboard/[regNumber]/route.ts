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
        status,
        created_at
      `)
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get all fee records for the student
    const { data: fees, error: feesError } = await supabaseAdmin
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })

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

    // Calculate comprehensive financial summary
    const totalBilled = fees?.reduce((sum, fee) => sum + parseFloat(fee.total_billed?.toString() || fee.total_fee?.toString() || '0'), 0) || 0
    const totalPaid = payments?.reduce((sum, payment) => sum + parseFloat(payment.amount?.toString() || '0'), 0) || 0
    const balance = totalBilled - totalPaid
    const paymentProgress = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0

    // Current semester information
    const currentSemesterFee = fees && fees.length > 0 ? fees[0] : null
    const currentSemesterPaid = currentSemesterFee 
      ? parseFloat(currentSemesterFee.total_paid?.toString() || currentSemesterFee.amount_paid?.toString() || '0')
      : 0
    const currentSemesterBalance = currentSemesterFee 
      ? parseFloat(currentSemesterFee.total_billed?.toString() || currentSemesterFee.total_fee?.toString() || '0') - currentSemesterPaid
      : 0

    // Payment status determination
    let paymentStatus = 'unpaid'
    let statusColor = 'red'
    let statusMessage = 'No payments made'

    if (balance <= 0) {
      paymentStatus = 'paid'
      statusColor = 'green'
      statusMessage = 'Fully paid'
    } else if (totalPaid > 0) {
      paymentStatus = 'partial'
      statusColor = 'yellow'
      statusMessage = 'Partially paid'
    }

    // Important status checks
    const canAccessExamCard = paymentProgress >= 60
    const isOverdue = currentSemesterFee && new Date() > new Date(new Date(currentSemesterFee.created_at).getTime() + 30 * 24 * 60 * 60 * 1000) && balance > 0

    // Recent activity (last 5 transactions)
    const recentPayments = payments?.slice(0, 5).map(payment => ({
      id: payment.id,
      amount: parseFloat(payment.amount.toString()),
      payment_method: payment.payment_method,
      reference_number: payment.reference_number,
      payment_date: payment.payment_date,
      status: payment.status || 'confirmed',
      notes: payment.notes
    })) || []

    // Payment statistics
    const paymentStats = {
      total_transactions: payments?.length || 0,
      average_payment: payments && payments.length > 0 ? totalPaid / payments.length : 0,
      largest_payment: payments && payments.length > 0 
        ? Math.max(...payments.map(p => parseFloat(p.amount.toString()))) 
        : 0,
      smallest_payment: payments && payments.length > 0 
        ? Math.min(...payments.map(p => parseFloat(p.amount.toString()))) 
        : 0,
      first_payment_date: payments && payments.length > 0 
        ? payments[payments.length - 1].payment_date 
        : null,
      last_payment_date: payments && payments.length > 0 
        ? payments[0].payment_date 
        : null,
      payment_methods_used: [...new Set(payments?.map(p => p.payment_method) || [])],
      months_with_payments: [...new Set(payments?.map(p => 
        new Date(p.payment_date).toISOString().slice(0, 7)
      ) || [])]
    }

    // Fee breakdown for current semester
    const feeBreakdown = currentSemesterFee ? {
      tuition_fee: parseFloat(currentSemesterFee.tuition_fee.toString()),
      exam_fee: parseFloat(currentSemesterFee.exam_fee.toString()),
      library_fee: parseFloat(currentSemesterFee.library_fee.toString()),
      lab_fee: parseFloat(currentSemesterFee.lab_fee.toString()),
      activity_fee: parseFloat(currentSemesterFee.activity_fee.toString()),
      total_fee: parseFloat(currentSemesterFee.total_fee.toString())
    } : null

    // Payment reminders and notifications
    const notifications = []
    
    if (isOverdue) {
      notifications.push({
        type: 'error',
        title: 'Payment Overdue',
        message: `Your payment is overdue. Please pay KES ${balance.toLocaleString()} to avoid penalties.`,
        action: 'make_payment'
      })
    }

    if (balance > 0 && paymentProgress < 60) {
      notifications.push({
        type: 'warning',
        title: 'Exam Card Access',
        message: `Pay at least 60% of your fees to access your exam card. You need KES ${Math.max(0, (totalBilled * 0.6) - totalPaid).toLocaleString()} more.`,
        action: 'make_payment'
      })
    }

    if (balance > 0 && paymentProgress >= 60) {
      notifications.push({
        type: 'info',
        title: 'Outstanding Balance',
        message: `You have an outstanding balance of KES ${balance.toLocaleString()}.`,
        action: 'make_payment'
      })
    }

    // Quick actions available to the student
    const quickActions = [
      {
        id: 'make_payment',
        label: 'Make Payment',
        description: 'Pay your fees using various payment methods',
        icon: 'credit-card',
        enabled: balance > 0,
        href: '/student/make-payment'
      },
      {
        id: 'view_statement',
        label: 'Fee Statement',
        description: 'View or download your fee statement',
        icon: 'file-text',
        enabled: true,
        href: '/student/fee-statement'
      },
      {
        id: 'payment_history',
        label: 'Payment History',
        description: 'View all your payment transactions',
        icon: 'history',
        enabled: payments && payments.length > 0,
        href: '/student/payment-history'
      },
      {
        id: 'exam_card',
        label: 'Exam Card',
        description: 'Download your exam card',
        icon: 'id-card',
        enabled: canAccessExamCard,
        href: '/student/exam-card'
      },
      {
        id: 'verify_payment',
        label: 'Verify Payment',
        description: 'Check payment status using reference number',
        icon: 'check-circle',
        enabled: true,
        href: '/student/verify-payment'
      }
    ]

    const financeDashboard = {
      student: {
        id: student.id,
        registration_number: student.registration_number,
        name: student.name,
        email: student.email,
        phone: student.phone,
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
        can_access_exam_card: canAccessExamCard,
        is_overdue: isOverdue
      },
      current_semester: {
        fee_details: feeBreakdown,
        academic_year: currentSemesterFee?.academic_year || null,
        semester: currentSemesterFee?.semester || null,
        total_fee: currentSemesterFee ? parseFloat(currentSemesterFee.total_fee.toString()) : 0,
        amount_paid: currentSemesterPaid,
        balance: currentSemesterBalance,
        payment_progress: currentSemesterFee && parseFloat(currentSemesterFee.total_fee.toString()) > 0 
          ? Math.round((currentSemesterPaid / parseFloat(currentSemesterFee.total_fee.toString())) * 100) 
          : 0
      },
      payment_statistics: paymentStats,
      recent_payments: recentPayments,
      notifications: notifications,
      quick_actions: quickActions,
      payment_cards: [
        {
          title: 'Total Billed',
          value: totalBilled,
          formatted_value: `KES ${totalBilled.toLocaleString()}`,
          icon: 'receipt',
          color: 'blue'
        },
        {
          title: 'Total Paid',
          value: totalPaid,
          formatted_value: `KES ${totalPaid.toLocaleString()}`,
          icon: 'check-circle',
          color: 'green'
        },
        {
          title: 'Balance',
          value: balance,
          formatted_value: `KES ${balance.toLocaleString()}`,
          icon: 'clock',
          color: balance > 0 ? 'red' : 'green'
        },
        {
          title: 'Payment Progress',
          value: paymentProgress,
          formatted_value: `${paymentProgress}%`,
          icon: 'trending-up',
          color: paymentProgress >= 60 ? 'green' : paymentProgress >= 30 ? 'yellow' : 'red'
        }
      ],
      generated_at: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: financeDashboard })
  } catch (error) {
    console.error('Error in finance dashboard API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
