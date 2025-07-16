import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('student_id')

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 })
    }

    const { data: units, error } = await supabaseAdmin
      .from('student_units')
      .select(`
        *,
        units!inner(
          id,
          unit_name,
          unit_code
        )
      `)
      .eq('student_id', studentId)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
    }

    const registered_units = units?.map(unit => ({
      id: unit.units.unit_code,
      name: unit.units.unit_name,
      code: unit.units.unit_code,
      status: unit.status
    })) || []

    return NextResponse.json({ success: true, registered_units })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}