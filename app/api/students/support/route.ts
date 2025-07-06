import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      registrationNumber,
      category,
      subject,
      message,
      priority = 'medium'
    } = body

    if (!registrationNumber || !category || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Validate category
    const validCategories = ['technical', 'account', 'billing', 'academic', 'other']
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, message: 'Invalid category' },
        { status: 400 }
      )
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent']
    if (!validPriorities.includes(priority)) {
      return NextResponse.json(
        { success: false, message: 'Invalid priority level' },
        { status: 400 }
      )
    }

    // Create support ticket
    const { data: ticket, error } = await supabaseAdmin
      .from('support_tickets')
      .insert({
        registration_number: registrationNumber,
        category,
        subject,
        message,
        priority,
        status: 'open',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to create support ticket' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Support ticket created successfully',
      data: ticket
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationNumber = searchParams.get('registrationNumber')

    if (!registrationNumber) {
      return NextResponse.json(
        { success: false, message: 'Registration number is required' },
        { status: 400 }
      )
    }

    // Fetch student's support tickets
    const { data: tickets, error } = await supabaseAdmin
      .from('support_tickets')
      .select('*')
      .eq('registration_number', registrationNumber)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch support tickets' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: tickets || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
