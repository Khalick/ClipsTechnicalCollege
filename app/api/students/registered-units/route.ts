import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const student_id = searchParams.get("student_id")

    if (!student_id) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 })
    }

    const { data: registeredUnits, error } = await supabase
      .from("student_units")
      .select(`
        unit_id,
        registration_date,
        status,
        units!inner(
          id,
          unit_name,
          unit_code,
          credits
        )
      `)
      .eq("student_id", student_id)
      .eq("status", "registered")

    if (error) {
      return NextResponse.json({ error: "Failed to fetch registered units" }, { status: 500 })
    }

    const formattedUnits = registeredUnits?.map((unit: any) => ({
      id: unit.unit_id.toString(),
      name: unit.units.unit_name,
      code: unit.units.unit_code,
      status: unit.status,
      credits: unit.units.credits,
      registration_date: unit.registration_date
    })) || []

    return NextResponse.json({ success: true, registered_units: formattedUnits })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}