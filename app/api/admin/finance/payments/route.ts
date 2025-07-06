import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const paymentMethod = searchParams.get('paymentMethod') || 'all'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build base query for payments with student information
    let query = supabaseAdmin
      .from('fee_payments')
      .select(`
        *,
        students (
          id,
          registration_number,
          name,
          email,
          phone,
          course,
          year_of_study,
          semester
        )
      `)

    // Apply filters
    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod)
    }

    if (startDate) {
      query = query.gte('payment_date', startDate)
    }

    if (endDate) {
      query = query.lte('payment_date', endDate)
    }

    // Apply search filter
    if (search) {
      query = query.or(`students.name.ilike.%${search}%,students.registration_number.ilike.%${search}%,reference_number.ilike.%${search}%`)
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('fee_payments')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error counting payments:', countError)
    }

    // Apply pagination and ordering
    const { data: payments, error: paymentsError } = await query
      .order('payment_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    // Get summary statistics
    const { data: allPayments, error: summaryError } = await supabaseAdmin
      .from('fee_payments')
      .select('amount, payment_method, payment_date, status')

    if (summaryError) {
      console.error('Error fetching summary data:', summaryError)
    }

    // Calculate summary statistics
    const totalPayments = allPayments?.length || 0
    const totalAmount = allPayments?.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) || 0
    const confirmedPayments = allPayments?.filter(p => p.status === 'confirmed' || !p.status).length || 0
    const pendingPayments = allPayments?.filter(p => p.status === 'pending').length || 0
    const rejectedPayments = allPayments?.filter(p => p.status === 'rejected').length || 0

    // Payment method statistics
    const paymentMethodStats = allPayments?.reduce((acc, payment) => {
      const method = payment.payment_method || 'unknown'
      acc[method] = (acc[method] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Monthly payment statistics (last 12 months)
    const monthlyStats = allPayments?.reduce((acc, payment) => {
      const monthKey = new Date(payment.payment_date).toISOString().slice(0, 7)
      if (!acc[monthKey]) {
        acc[monthKey] = { count: 0, amount: 0 }
      }
      acc[monthKey].count += 1
      acc[monthKey].amount += parseFloat(payment.amount.toString())
      return acc
    }, {} as Record<string, { count: number; amount: number }>) || {}

    // Get students with outstanding balances
    const { data: studentsWithBalances, error: balanceError } = await supabaseAdmin
      .from('students')
      .select(`
        id,
        registration_number,
        name,
        course,
        fees (
          total_fee,
          amount_paid
        )
      `)
      .limit(10)

    if (balanceError) {
      console.error('Error fetching students with balances:', balanceError)
    }

    // Format the response
    const adminFinanceData = {
      payments: payments?.map(payment => ({
        id: payment.id,
        student: payment.students ? {
          id: payment.students.id,
          registration_number: payment.students.registration_number,
          name: payment.students.name,
          email: payment.students.email,
          phone: payment.students.phone,
          course: payment.students.course,
          year_of_study: payment.students.year_of_study,
          semester: payment.students.semester
        } : null,
        amount: parseFloat(payment.amount.toString()),
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        payment_date: payment.payment_date,
        status: payment.status || 'confirmed',
        notes: payment.notes,
        student_initiated: payment.student_initiated || false,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      })) || [],
      summary: {
        total_payments: totalPayments,
        total_amount: totalAmount,
        confirmed_payments: confirmedPayments,
        pending_payments: pendingPayments,
        rejected_payments: rejectedPayments,
        average_payment: totalPayments > 0 ? totalAmount / totalPayments : 0,
        payment_method_stats: paymentMethodStats,
        monthly_stats: monthlyStats
      },
      students_with_balances: studentsWithBalances?.map(student => ({
        id: student.id,
        registration_number: student.registration_number,
        name: student.name,
        course: student.course,
        total_billed: student.fees?.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0) || 0,
        total_paid: student.fees?.reduce((sum, fee) => sum + parseFloat(fee.amount_paid.toString()), 0) || 0,
        balance: (student.fees?.reduce((sum, fee) => sum + parseFloat(fee.total_fee.toString()), 0) || 0) - 
                (student.fees?.reduce((sum, fee) => sum + parseFloat(fee.amount_paid.toString()), 0) || 0)
      })) || [],
      pagination: {
        current_page: page,
        per_page: limit,
        total_count: totalCount || 0,
        total_pages: Math.ceil((totalCount || 0) / limit),
        has_next: page * limit < (totalCount || 0),
        has_prev: page > 1
      },
      filters: {
        search,
        status,
        payment_method: paymentMethod,
        start_date: startDate,
        end_date: endDate
      },
      generated_at: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: adminFinanceData })
  } catch (error) {
    console.error('Error in admin finance API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Update payment status (approve/reject)
export async function PATCH(request: NextRequest) {
  try {
    const { payment_id, status, notes } = await request.json()

    if (!payment_id || !status) {
      return NextResponse.json({ 
        error: 'Payment ID and status are required' 
      }, { status: 400 })
    }

    if (!['confirmed', 'pending', 'rejected'].includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be confirmed, pending, or rejected' 
      }, { status: 400 })
    }

    // Update payment status
    const { data: payment, error: updateError } = await supabaseAdmin
      .from('fee_payments')
      .update({
        status: status,
        notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', payment_id)
      .select(`
        *,
        students (
          id,
          registration_number,
          name,
          email
        )
      `)
      .single()

    if (updateError) {
      console.error('Error updating payment status:', updateError)
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 })
    }

    // If payment is confirmed, update the fee record
    if (status === 'confirmed') {
      const { data: feeRecord, error: feeError } = await supabaseAdmin
        .from('fees')
        .select('*')
        .eq('student_id', payment.students.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (feeError) {
        console.error('Error fetching fee record:', feeError)
      } else if (feeRecord && feeRecord.length > 0) {
        const currentAmountPaid = parseFloat(feeRecord[0].amount_paid.toString())
        const newAmountPaid = currentAmountPaid + parseFloat(payment.amount.toString())

        const { error: updateFeeError } = await supabaseAdmin
          .from('fees')
          .update({
            amount_paid: newAmountPaid,
            updated_at: new Date().toISOString()
          })
          .eq('id', feeRecord[0].id)

        if (updateFeeError) {
          console.error('Error updating fee record:', updateFeeError)
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Payment ${status} successfully`,
      data: {
        payment: {
          id: payment.id,
          amount: parseFloat(payment.amount.toString()),
          status: payment.status,
          notes: payment.notes,
          updated_at: payment.updated_at
        },
        student: payment.students
      }
    })

  } catch (error) {
    console.error('Error updating payment status:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
