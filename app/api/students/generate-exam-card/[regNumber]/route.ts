import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(
  request: NextRequest,
  { params }: { params: { regNumber: string } }
) {
  try {
    const { regNumber } = params

    // Get student data
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('registration_number', regNumber)
      .single()

    if (studentError || !student) {
      return NextResponse.json({ success: false, error: 'Student not found' }, { status: 404 })
    }

    // Get registered units
    const { data: units, error: unitsError } = await supabaseAdmin
      .from('student_units')
      .select(`
        units (
          id,
          name,
          code
        )
      `)
      .eq('student_id', student.id)

    const registeredUnits = units?.map(u => u.units).filter(Boolean) || []

    return NextResponse.json({
      success: true,
      data: {
        student,
        units: registeredUnits
      }
    })

  } catch (error) {
    console.error('Error generating exam card data:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}