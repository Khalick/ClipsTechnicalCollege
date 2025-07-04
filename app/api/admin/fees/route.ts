import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin as supabase } from '@/lib/supabase-client'

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

// Add bulk billing endpoint
export async function PATCH(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    if (action === 'bulk_bill') {
      const { student_ids, semester, total_fee, due_date } = data

      if (!student_ids || !Array.isArray(student_ids) || !semester || !total_fee) {
        return NextResponse.json({ error: 'Missing required fields for bulk billing' }, { status: 400 })
      }

      const billRecords = student_ids.map(student_id => ({
        student_id,
        semester,
        total_fee,
        amount_paid: 0,
        due_date: due_date || null,
        updated_at: new Date().toISOString()
      }))

      const { data: billData, error } = await supabase
        .from('fees')
        .upsert(billRecords)
        .select()

      if (error) {
        console.error('Error creating bulk fee records:', error)
        return NextResponse.json({ error: 'Failed to create bulk fee records' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        data: billData,
        message: `Successfully billed ${student_ids.length} students` 
      })
    }

    if (action === 'generate_statements') {
      const { semester } = data

      // Fetch fee records with student details for statement generation
      const { data: feeRecords, error } = await supabase
        .from('fees')
        .select(`
          *,
          students!inner(
            id,
            name,
            registration_number,
            course,
            email
          )
        `)
        .eq('semester', semester)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching fee records for statements:', error)
        return NextResponse.json({ error: 'Failed to fetch fee records' }, { status: 500 })
      }

      return NextResponse.json({ 
        success: true, 
        data: feeRecords,
        message: `Generated statements for ${feeRecords.length} students` 
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in fee management PATCH API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
