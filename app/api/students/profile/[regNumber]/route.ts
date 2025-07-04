import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ regNumber: string }> }
) {
  try {
    const { regNumber } = await context.params

    if (!regNumber) {
      return NextResponse.json({ error: 'Registration number is required' }, { status: 400 })
    }

    // Fetch student data by registration number
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      console.error('Student not found:', studentError)
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Return the student data
    return NextResponse.json({ 
      success: true, 
      data: {
        id: student.id.toString(),
        name: student.name,
        registration_number: student.registration_number,
        course: student.course,
        level_of_study: student.level_of_study,
        status: student.status,
        national_id: student.national_id,
        date_of_birth: student.date_of_birth,
        email: student.email,
        photo_url: student.photo_url,
        birth_certificate: student.birth_certificate
      }
    })
  } catch (error) {
    console.error('Error in student profile API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
