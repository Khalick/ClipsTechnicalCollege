import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(request: NextRequest, { params }: { params: Promise<{ regNumber: string }> | { regNumber: string } }) {
  try {
    const { regNumber: rawRegNumber } = 'then' in params ? await params : params;
    const regNumber = decodeURIComponent(rawRegNumber);

    console.log('Looking for student with registration number:', regNumber);

    // Try exact match first
    let { data: student, error } = await supabaseAdmin
      .from('students')
      .select('*')
      .eq('registration_number', regNumber)
      .single();

    // If not found, try with URL-encoded slashes
    if ((!student || error) && regNumber.includes('/')) {
      const encodedRegNumber = regNumber.replace(/\//g, '%2F');
      const result = await supabaseAdmin
        .from('students')
        .select('*')
        .eq('registration_number', encodedRegNumber)
        .single();
      if (result.data) {
        student = result.data;
        error = null;
      }
    }

    // If still not found, try splitting and searching by parts if your DB supports it
    if ((!student || error) && regNumber.includes('/')) {
      const parts = regNumber.split('/');
      if (parts.length >= 4) {
        // Example: CT100/A/1/26 => course_code/section/year/serial
        const [course_code, section, year, serial] = parts;
        const result = await supabaseAdmin
          .from('students')
          .select('*')
          .eq('course_code', course_code)
          .eq('section', section)
          .eq('year', year)
          .eq('serial', serial)
          .single();
        if (result.data) {
          student = result.data;
          error = null;
        }
      }
    }

    console.log('Student query result:', { student, error });

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: student });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}