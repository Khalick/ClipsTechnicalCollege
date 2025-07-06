import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

interface PaymentItem {
  id: string
  reference_number: string
  amount: number
  payment_method: string
  payment_date: string
  notes?: string
  student_initiated: boolean
  created_at: string
}

interface PaymentsByStatus {
  confirmed?: PaymentItem[]
  pending?: PaymentItem[]
  rejected?: PaymentItem[]
  [key: string]: PaymentItem[] | undefined
}

interface StatusCounts {
  confirmed: number
  pending: number
  rejected: number
  total: number
}

interface TotalAmountByStatus {
  confirmed: number
  pending: number
  rejected: number
}

interface StudentInfo {
  id: string
  registration_number: string
  name: string
}

interface StatusSummary {
  student: StudentInfo
  payments_by_status: PaymentsByStatus
  status_counts: StatusCounts
  total_amount_by_status: TotalAmountByStatus
  generated_at: string
}

export async function POST(request: NextRequest) {
  try {
    const { reference_number, registration_number } = await request.json()

    if (!reference_number) {
      return NextResponse.json({ 
        error: 'Reference number is required' 
      }, { status: 400 })
    }

    // Search for payment by reference number
    let query = supabaseAdmin
      .from('fee_payments')
      .select(`
        *,
        students (
          id,
          registration_number,
          name,
          email,
          phone
        )
      `)
      .eq('reference_number', reference_number)

    // If registration number is provided, add it to the query for additional verification
    if (registration_number) {
      query = query.eq('students.registration_number', registration_number)
    }

    const { data: payments, error: paymentError } = await query

    if (paymentError) {
      console.error('Error searching for payment:', paymentError)
      return NextResponse.json({ error: 'Failed to search for payment' }, { status: 500 })
    }

    if (!payments || payments.length === 0) {
      return NextResponse.json({ 
        success: false,
        message: 'No payment found with this reference number',
        payment_found: false
      })
    }

    const payment = payments[0]
    const student = payment.students

    // Get additional payment context
    const { data: allPayments, error: allPaymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select('amount, payment_date')
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false })

    if (allPaymentsError) {
      console.error('Error fetching all payments:', allPaymentsError)
    }

    // Get current fee information
    const { data: currentFee, error: feeError } = await supabaseAdmin
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (feeError) {
      console.error('Error fetching current fee:', feeError)
    }

    // Calculate payment summary
    const totalPaid = allPayments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0
    const totalBilled = currentFee && currentFee.length > 0 
      ? parseFloat(currentFee[0].total_fee.toString()) 
      : 0
    const balance = totalBilled - totalPaid
    const paymentProgress = totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0

    // Format payment verification result
    const verificationResult = {
      payment_found: true,
      payment: {
        id: payment.id,
        reference_number: payment.reference_number,
        amount: parseFloat(payment.amount.toString()),
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        status: payment.status || 'confirmed',
        notes: payment.notes,
        student_initiated: payment.student_initiated || false,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      },
      student: {
        id: student.id,
        registration_number: student.registration_number,
        name: student.name,
        email: student.email,
        phone: student.phone
      },
      payment_summary: {
        total_paid: totalPaid,
        total_billed: totalBilled,
        balance: balance,
        payment_progress: paymentProgress,
        payment_count: allPayments?.length || 0,
        last_payment_date: allPayments && allPayments.length > 0 ? allPayments[0].payment_date : null
      },
      verification_details: {
        verified_at: new Date().toISOString(),
        payment_age_days: Math.floor((new Date().getTime() - new Date(payment.payment_date).getTime()) / (1000 * 60 * 60 * 24)),
        is_recent: Math.floor((new Date().getTime() - new Date(payment.payment_date).getTime()) / (1000 * 60 * 60 * 24)) <= 7,
        payment_order: (allPayments?.findIndex(p => p.payment_date === payment.payment_date) ?? -1) + 1 || 1
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Payment found and verified successfully',
      data: verificationResult 
    })

  } catch (error) {
    console.error('Error in payment verification API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const regNumber = searchParams.get('regNumber')
    const status = searchParams.get('status') || 'all'

    if (!regNumber) {
      return NextResponse.json({ 
        error: 'Registration number is required' 
      }, { status: 400 })
    }

    // Get student ID
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id, registration_number, name')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ 
        error: 'Student not found' 
      }, { status: 404 })
    }

    // Get all payments for this student
    const { data: payments, error: paymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select(`
        id,
        reference_number,
        amount,
        payment_method,
        payment_date,
        notes,
        student_initiated,
        created_at,
        status
      `)
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false })

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError)
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
    }

    // Group payments by status
    const paymentsByStatus: PaymentsByStatus = {}
    payments?.forEach(payment => {
      const paymentStatus = payment.status || 'confirmed'
      if (!paymentsByStatus[paymentStatus]) {
        paymentsByStatus[paymentStatus] = []
      }
      paymentsByStatus[paymentStatus]!.push({
        id: payment.id,
        reference_number: payment.reference_number,
        amount: parseFloat(payment.amount.toString()),
        payment_method: payment.payment_method,
        payment_date: payment.payment_date,
        notes: payment.notes,
        student_initiated: payment.student_initiated || false,
        created_at: payment.created_at
      })
    })

    const statusSummary: StatusSummary = {
        student: {
            id: student.id,
            registration_number: student.registration_number,
            name: student.name
        },
        payments_by_status: paymentsByStatus,
        status_counts: {
            confirmed: paymentsByStatus.confirmed?.length || 0,
            pending: paymentsByStatus.pending?.length || 0,
            rejected: paymentsByStatus.rejected?.length || 0,
            total: payments?.length || 0
        },
        total_amount_by_status: {
            confirmed: paymentsByStatus.confirmed?.reduce((sum: number, p: PaymentItem) => sum + p.amount, 0) || 0,
            pending: paymentsByStatus.pending?.reduce((sum: number, p: PaymentItem) => sum + p.amount, 0) || 0,
            rejected: paymentsByStatus.rejected?.reduce((sum: number, p: PaymentItem) => sum + p.amount, 0) || 0
        },
        generated_at: new Date().toISOString()
    }

    return NextResponse.json({ 
      success: true, 
      data: statusSummary 
    })

  } catch (error) {
    console.error('Error in payment status API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
