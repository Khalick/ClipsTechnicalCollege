import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current_month'

    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0)

    // Date range based on period
    let startDate: Date, endDate: Date
    switch (period) {
      case 'current_month':
        startDate = startOfMonth
        endDate = endOfMonth
        break
      case 'last_month':
        startDate = new Date(currentYear, currentMonth - 1, 1)
        endDate = new Date(currentYear, currentMonth, 0)
        break
      case 'current_year':
        startDate = new Date(currentYear, 0, 1)
        endDate = new Date(currentYear, 11, 31)
        break
      case 'last_year':
        startDate = new Date(currentYear - 1, 0, 1)
        endDate = new Date(currentYear - 1, 11, 31)
        break
      default:
        startDate = startOfMonth
        endDate = endOfMonth
    }

    // Get all payments
    const { data: allPayments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select(`
        *,
        students (
          id,
          registration_number,
          name,
          course,
          year_of_study
        )
      `)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    // Get all fees
    const { data: allFees, error: feesError } = await supabaseAdmin
      .from('fees')
      .select(`
        *,
        students (
          id,
          registration_number,
          name,
          course,
          year_of_study
        )
      `)

    if (feesError) {
      console.error('Error fetching fees:', feesError)
      return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
    }

    // Get all students
    const { data: allStudents, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('id, registration_number, name, course, year_of_study, status')

    if (studentsError) {
      console.error('Error fetching students:', studentsError)
      return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
    }

    // Filter payments by period
    const periodPayments = allPayments?.filter(payment => {
      const paymentDate = new Date(payment.payment_date)
      return paymentDate >= startDate && paymentDate <= endDate
    }) || []

    // Calculate financial metrics
    const totalStudents = allStudents?.length || 0
    const totalBilled = allFees?.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0) || 0
    const totalPaid = allPayments?.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) || 0
    const totalOutstanding = totalBilled - totalPaid

    // Period-specific metrics
    const periodRevenue = periodPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0)
    const periodPaymentCount = periodPayments.length

    // Payment status breakdown
    const confirmedPayments = allPayments?.filter(p => p.status === 'confirmed' || !p.status).length || 0
    const pendingPayments = allPayments?.filter(p => p.status === 'pending').length || 0
    const rejectedPayments = allPayments?.filter(p => p.status === 'rejected').length || 0

    // Payment method breakdown
    const paymentMethodStats = allPayments?.reduce((acc, payment) => {
      const method = payment.payment_method || 'unknown'
      acc[method] = (acc[method] || 0) + parseFloat(payment.amount.toString())
      return acc
    }, {} as Record<string, number>) || {}

    // Course-wise financial breakdown
    const courseStats = allStudents?.reduce((acc, student) => {
      const course = student.course || 'Unknown'
      if (!acc[course]) {
        acc[course] = { students: 0, total_billed: 0, total_paid: 0, outstanding: 0 }
      }
      acc[course].students += 1

      // Get fees for this student
      const studentFees = allFees?.filter(fee => fee.student_id === student.id) || []
      const studentBilled = studentFees.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0)
      
      // Get payments for this student
      const studentPayments = allPayments?.filter(payment => payment.student_id === student.id) || []
      const studentPaid = studentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0)

      acc[course].total_billed += studentBilled
      acc[course].total_paid += studentPaid
      acc[course].outstanding += (studentBilled - studentPaid)

      return acc
    }, {} as Record<string, any>) || {}

    // Year-wise breakdown
    const yearStats = allStudents?.reduce((acc, student) => {
      const year = student.year_of_study || 'Unknown'
      if (!acc[year]) {
        acc[year] = { students: 0, total_billed: 0, total_paid: 0 }
      }
      acc[year].students += 1

      // Get fees for this student
      const studentFees = allFees?.filter(fee => fee.student_id === student.id) || []
      const studentBilled = studentFees.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0)
      
      // Get payments for this student
      const studentPayments = allPayments?.filter(payment => payment.student_id === student.id) || []
      const studentPaid = studentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0)

      acc[year].total_billed += studentBilled
      acc[year].total_paid += studentPaid

      return acc
    }, {} as Record<string, any>) || {}

    // Recent payments (last 10)
    const recentPayments = allPayments?.slice(0, 10).map(payment => ({
      id: payment.id,
      student: payment.students ? {
        registration_number: payment.students.registration_number,
        name: payment.students.name,
        course: payment.students.course
      } : null,
      amount: parseFloat(payment.amount.toString()),
      payment_method: payment.payment_method,
      reference_number: payment.reference_number,
      payment_date: payment.payment_date,
      status: payment.status || 'confirmed'
    })) || []

    // Top defaulters (students with highest outstanding balances)
    const studentsWithBalances = allStudents?.map(student => {
      const studentFees = allFees?.filter(fee => fee.student_id === student.id) || []
      const studentBilled = studentFees.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0)
      
      const studentPayments = allPayments?.filter(payment => payment.student_id === student.id) || []
      const studentPaid = studentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0)

      return {
        id: student.id,
        registration_number: student.registration_number,
        name: student.name,
        course: student.course,
        year_of_study: student.year_of_study,
        status: student.status,
        total_billed: studentBilled,
        total_paid: studentPaid,
        outstanding: studentBilled - studentPaid,
        payment_progress: studentBilled > 0 ? Math.round((studentPaid / studentBilled) * 100) : 0
      }
    }).filter(student => student.outstanding > 0)
      .sort((a, b) => b.outstanding - a.outstanding)
      .slice(0, 10) || []

    // Top payers (fully paid students)
    const topPayers = allStudents?.map(student => {
      const studentFees = allFees?.filter(fee => fee.student_id === student.id) || []
      const studentBilled = studentFees.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0)
      
      const studentPayments = allPayments?.filter(payment => payment.student_id === student.id) || []
      const studentPaid = studentPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0)

      return {
        id: student.id,
        registration_number: student.registration_number,
        name: student.name,
        course: student.course,
        total_billed: studentBilled,
        total_paid: studentPaid,
        outstanding: studentBilled - studentPaid,
        payment_progress: studentBilled > 0 ? Math.round((studentPaid / studentBilled) * 100) : 0
      }
    }).filter(student => student.outstanding <= 0 && student.total_paid > 0)
      .sort((a, b) => b.total_paid - a.total_paid)
      .slice(0, 10) || []

    // Monthly revenue trend (last 12 months)
    const monthlyRevenue = []
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1)
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0)
      
      const monthPayments = allPayments?.filter(payment => {
        const paymentDate = new Date(payment.payment_date)
        return paymentDate >= monthStart && paymentDate <= monthEnd
      }) || []

      const monthRevenue = monthPayments.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0)
      
      monthlyRevenue.push({
        month: month.toISOString().slice(0, 7),
        month_name: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        payment_count: monthPayments.length
      })
    }

    const adminFinanceDashboard = {
      overview: {
        total_students: totalStudents,
        total_billed: totalBilled,
        total_paid: totalPaid,
        total_outstanding: totalOutstanding,
        collection_rate: totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0,
        period_revenue: periodRevenue,
        period_payment_count: periodPaymentCount,
        average_payment: periodPaymentCount > 0 ? periodRevenue / periodPaymentCount : 0
      },
      payment_status: {
        confirmed: confirmedPayments,
        pending: pendingPayments,
        rejected: rejectedPayments,
        total: (confirmedPayments + pendingPayments + rejectedPayments)
      },
      payment_methods: paymentMethodStats,
      course_breakdown: courseStats,
      year_breakdown: yearStats,
      recent_payments: recentPayments,
      top_defaulters: studentsWithBalances,
      top_payers: topPayers,
      monthly_revenue_trend: monthlyRevenue,
      period_info: {
        selected_period: period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      },
      generated_at: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: adminFinanceDashboard })
  } catch (error) {
    console.error('Error in admin finance dashboard API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
