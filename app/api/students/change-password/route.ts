import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { registrationNumber, currentPassword, newPassword } = body

    if (!registrationNumber || !currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      )
    }

    // Fetch student data to verify current password
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('registration_number', registrationNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, message: 'Student not found' },
        { status: 404 }
      )
    }

    // For age-based authentication, we need to check if the current password matches
    // the student's document number (national_id or birth_certificate)
    const currentAge = new Date().getFullYear() - new Date(student.date_of_birth).getFullYear()
    const expectedPassword = currentAge >= 18 ? student.national_id : student.birth_certificate

    if (currentPassword !== expectedPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password is incorrect' },
        { status: 401 }
      )
    }

    // Validate new password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the password in the database
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('registration_number', registrationNumber)

    if (updateError) {
      console.error('Database error:', updateError)
      return NextResponse.json(
        { success: false, message: 'Failed to update password' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
