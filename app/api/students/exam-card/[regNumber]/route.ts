import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ regNumber: string }> }
) {
  try {
    const { regNumber } = await context.params

    if (!regNumber) {
      return NextResponse.json({ error: 'Registration number is required' }, { status: 400 })
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Database connection error' }, { status: 500 })
    }

    // Get student information
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    // Get registered units for the student
    const { data: registeredUnits, error: unitsError } = await supabase
      .from('student_units')
      .select(`
        unit_id,
        registration_date,
        status,
        units!inner(
          id,
          unit_name,
          unit_code,
          credits,
          description
        )
      `)
      .eq('student_id', student.id)
      .eq('status', 'registered')

    if (unitsError) {
      console.error('Error fetching registered units:', unitsError)
      return NextResponse.json({ error: 'Failed to fetch registered units' }, { status: 500 })
    }

    // Format the units data
    const formattedUnits = registeredUnits?.map((unit: any) => ({
      id: unit.units.id,
      unit_name: unit.units.unit_name,
      unit_code: unit.units.unit_code,
      credits: unit.units.credits,
      description: unit.units.description,
      registration_date: unit.registration_date
    })) || []

    // Calculate total credits
    const totalCredits = formattedUnits.reduce((sum, unit) => sum + (unit.credits || 0), 0)

    const examCardData = {
      student: {
        id: student.id,
        name: student.name,
        registration_number: student.registration_number,
        course: student.course,
        level_of_study: student.level_of_study,
        email: student.email,
        photo_url: student.photo_url,
        status: student.status
      },
      units: formattedUnits,
      summary: {
        total_units: formattedUnits.length,
        total_credits: totalCredits,
        semester: new Date().getFullYear() + ' - ' + (new Date().getMonth() < 6 ? 'Semester 1' : 'Semester 2'),
        generated_at: new Date().toISOString()
      }
    }

    return NextResponse.json({ success: true, data: examCardData })
  } catch (error) {
    console.error('Error generating exam card:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
