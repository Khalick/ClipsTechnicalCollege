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

    // Fetch student's privacy settings
    const { data: settings, error } = await supabaseAdmin
      .from('student_privacy_settings')
      .select('*')
      .eq('registration_number', registrationNumber)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to fetch privacy settings' },
        { status: 500 }
      )
    }

    // Return default settings if none exist
    const defaultSettings = {
      profile_visibility: 'private',
      share_academic_info: false,
      share_contact_info: false,
      data_analytics: true,
      third_party_sharing: false
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
      profile_visibility,
      share_academic_info,
      share_contact_info,
      data_analytics,
      third_party_sharing
    } = body

    if (!registrationNumber) {
      return NextResponse.json(
        { success: false, message: 'Registration number is required' },
        { status: 400 }
      )
    }

    // Upsert privacy settings
    const { data, error } = await supabaseAdmin
      .from('student_privacy_settings')
      .upsert({
        registration_number: registrationNumber,
        profile_visibility,
        share_academic_info,
        share_contact_info,
        data_analytics,
        third_party_sharing,
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, message: 'Failed to update privacy settings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Privacy settings updated successfully',
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
