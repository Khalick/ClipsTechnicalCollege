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

    // Fetch notification settings
    const { data: settings, error } = await supabaseAdmin
      .from('student_notification_settings')
      .select('*')
      .eq('registration_number', registrationNumber)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows found"
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch notification settings' },
        { status: 500 }
      )
    }

    // Return default settings if none found
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { registrationNumber, settings } = body

    if (!registrationNumber || !settings) {
      return NextResponse.json(
        { success: false, message: 'Registration number and settings are required' },
        { status: 400 }
      )
    }

    // Upsert notification settings
    const { data, error } = await supabaseAdmin
      .from('student_notification_settings')
      .upsert({
        registration_number: registrationNumber,
        email_notifications: settings.emailNotifications,
        sms_notifications: settings.smsNotifications,
        push_notifications: settings.pushNotifications,
        fee_reminders: settings.feeReminders,
        academic_updates: settings.academicUpdates,
        system_alerts: settings.systemAlerts,
        marketing_emails: settings.marketingEmails,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to save notification settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Notification settings saved successfully',
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
