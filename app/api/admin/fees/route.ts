import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { student_id, semester, total_fee, amount_paid, due_date } = await request.json()

    if (!student_id || !semester || !total_fee) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Insert or update fee record
    const { data, error } = await supabase
      .from('fees')
      .upsert({
        student_id,
        semester,
        total_fee,
        amount_paid: amount_paid || 0,
        due_date: due_date || null,
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating fee record:', error)
      return NextResponse.json({ error: 'Failed to create fee record' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in fee creation API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const semester = searchParams.get('semester')

    let query = supabase
      .from('fees')
      .select(`
        *,
        students!inner(
          id,
          name,
          registration_number,
          course
        )
      `)
      .order('created_at', { ascending: false })

    if (semester) {
      query = query.eq('semester', semester)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching fees:', error)
      return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in fees API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
