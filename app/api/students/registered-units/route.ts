import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const student_id = searchParams.get("student_id")

    if (!student_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const { data: registeredUnits, error } = await supabaseAdmin
      .from("student_units")
      .select(`
        unit_id,
        registration_date,
        status,
        units(
          id,
          name,
          code
        )
      `)
      .eq("student_id", student_id)
      .eq("status", "registered")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch registered units" }, { status: 500 })
    }

    const formattedUnits = registeredUnits?.map((unit: any) => ({
      id: unit.units.id,
      name: unit.units.name,
      code: unit.units.code,
      status: unit.status
    })) || []

    return NextResponse.json({ success: true, registered_units: formattedUnits })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}