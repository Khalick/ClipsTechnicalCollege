import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ regNumber: string }> }
) {
  try {
    const { regNumber } = await context.params
    const { searchParams } = new URL(request.url)
    
    // Query parameters for filtering and pagination
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const paymentMethod = searchParams.get('paymentMethod')

    if (!regNumber) {
      return NextResponse.json({ error: 'Registration number is required' }, { status: 400 })
    }

    // Get student ID
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, name, registration_number')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Build query for payments
    let query = supabaseAdmin
      .from('fee_payments')
      .select(`
        *,
        amount,
        payment_method,
        reference_number,
        payment_date,
        notes,
        created_at,
        updated_at
      `)
      .eq('student_id', student.id)

    // Apply filters
    if (startDate) {
      query = query.gte('payment_date', startDate)
    }
    if (endDate) {
      query = query.lte('payment_date', endDate)
    }
    if (paymentMethod && paymentMethod !== 'all') {
      query = query.eq('payment_method', paymentMethod)
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabaseAdmin
      .from('fee_payments')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', student.id)

    if (countError) {
      console.error('Error counting payments:', countError)
    }

    // Apply pagination and ordering
    const { data: payments, error: paymentsError } = await query
      .order('payment_date', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payment history' }, { status: 500 })
    }

    // Calculate summary statistics
    const { data: allPayments, error: summaryError } = await supabaseAdmin
      .from('fee_payments')
      .select('amount, payment_method, payment_date')
      .eq('student_id', student.id)

    if (summaryError) {
      console.error('Error fetching payment summary:', summaryError)
    }

    const totalPaid = allPayments?.reduce((sum, payment) => sum + parseFloat(payment.amount.toString()), 0) || 0
    const paymentCount = allPayments?.length || 0

    // Group payments by method for statistics
    const paymentMethodStats = allPayments?.reduce((acc, payment) => {
      const method = payment.payment_method || 'unknown'
      acc[method] = (acc[method] || 0) + parseFloat(payment.amount.toString())
      return acc
    }, {} as Record<string, number>) || {}

    // Get recent payments (last 5)
    const { data: recentPayments, error: recentError } = await supabaseAdmin
      .from('fee_payments')
      .select('amount, payment_method, payment_date, reference_number')
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false })
      .limit(5)

    if (recentError) {
      console.error('Error fetching recent payments:', recentError)
    }

    const paymentHistory = {
      student: {
        id: student.id,
        name: student.name,
        registration_number: student.registration_number
      },
      summary: {
        total_paid: totalPaid,
        payment_count: paymentCount,
        average_payment: paymentCount > 0 ? totalPaid / paymentCount : 0,
        payment_methods: paymentMethodStats,
        first_payment_date: allPayments && allPayments.length > 0 
          ? allPayments.sort((a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime())[0].payment_date 
          : null,
        last_payment_date: allPayments && allPayments.length > 0 
          ? allPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())[0].payment_date 
          : null
      },
      payments: payments?.map(payment => ({
        id: payment.id,
        amount: parseFloat(payment.amount.toString()),
        payment_method: payment.payment_method,
        reference_number: payment.reference_number,
        payment_date: payment.payment_date,
        notes: payment.notes,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      })) || [],
      recent_payments: recentPayments?.map(payment => ({
        amount: parseFloat(payment.amount.toString()),
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        reference_number: payment.reference_number
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
        start_date: startDate,
        end_date: endDate,
        payment_method: paymentMethod
      },
      generated_at: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: paymentHistory })
  } catch (error) {
    console.error('Error in payment history API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
