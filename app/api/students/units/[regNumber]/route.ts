import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { regNumber: string } }
) {
  try {
    const { regNumber } = params

    // Get student ID first
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('id')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }

    // Get registered units
    const { data: registeredUnits, error } = await supabaseAdmin
      .from('student_units')
      .select(`
        units(
          id,
          name,
          code
        )
      `)
      .eq('student_id', student.id)

    if (error) {
      return NextResponse.json({ success: false, error: 'Failed to fetch units' }, { status: 500 })
    }

    const units = registeredUnits?.map(item => item.units).filter(Boolean) || []

    return NextResponse.json({
      success: true,
      registered_units: units
    })

  } catch (error) {
    console.error('Error fetching student units:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}