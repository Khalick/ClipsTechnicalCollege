import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ regNumber: string[] }> | { regNumber: string[] } }) {
  try {
    const { regNumber: regNumberArray } = 'then' in params ? await params : params
    const regNumber = regNumberArray.join('/')

    const { data: student, error } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('registration_number', regNumber)
      .single()

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: student })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}