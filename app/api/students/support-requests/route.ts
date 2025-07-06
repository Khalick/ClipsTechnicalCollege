import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { registrationNumber, category, message, priority = 'medium' } = body

    if (!registrationNumber || !category || !message) {
      return NextResponse.json(
        { success: false, message: 'Registration number, category, and message are required' },
        { status: 400 }
      )
    }

    // Generate a unique ticket ID
    const ticketId = `SUPP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Insert support request
    const { data, error } = await supabaseAdmin
      .from('support_requests')
      .insert({
        ticket_id: ticketId,
        registration_number: registrationNumber,
        category,
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
        { success: false, message: 'Failed to submit support request' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Support request submitted successfully',
      data: {
        ticketId,
        status: 'open',
        estimatedResponse: '24-48 hours'
      }
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

    // Fetch support requests for the student
    const { data: requests, error } = await supabaseAdmin
      .from('support_requests')
      .select('*')
      .eq('registration_number', registrationNumber)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch support requests' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: requests || []
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
