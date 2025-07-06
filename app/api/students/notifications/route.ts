import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

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

    // Fetch student's notification preferences
    const { data: settings, error } = await supabaseAdmin
      .from('student_notification_settings')
      .select('*')
      .eq('registration_number', registrationNumber)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch notification settings' },
        { status: 500 }
      )
    }

    // Return default settings if none exist
    const defaultSettings = {
      email_notifications: true,
      sms_notifications: false,
      push_notifications: true,
      fee_reminders: true,
      academic_updates: true,
      system_alerts: true,
      marketing_emails: false
    }

    return NextResponse.json({
      success: true,
      data: settings || defaultSettings
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      registrationNumber,
      email_notifications,
      sms_notifications,
      push_notifications,
      fee_reminders,
      academic_updates,
      system_alerts,
      marketing_emails
    } = body

    if (!registrationNumber) {
      return NextResponse.json(
        { success: false, message: 'Registration number is required' },
        { status: 400 }
      )
    }

    // Upsert notification settings
    const { data, error } = await supabaseAdmin
      .from('student_notification_settings')
      .upsert({
        registration_number: registrationNumber,
        email_notifications,
        sms_notifications,
        push_notifications,
        fee_reminders,
        academic_updates,
        system_alerts,
        marketing_emails,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to update notification settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification settings updated successfully',
      data
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
