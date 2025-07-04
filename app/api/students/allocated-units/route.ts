import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        {
          error: "Database connection not available",
          details: "Unable to connect to the database"
        },
        { status: 500 }
      )
    }

    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get("student_id")

    if (!studentId) {
      return NextResponse.json(
        {
          error: "Missing parameter",
          details: "student_id parameter is required"
        },
        { status: 400 }
      )
    }

    // Get allocated units for the student (using student_units table with status 'allocated')
    const { data: allocations, error } = await supabase
      .from("student_units")
      .select(`
        *,
        units!inner(
          id,
          unit_name,
          unit_code,
          description,
          credits
        )
      `)
      .eq("student_id", studentId)
      .eq("status", "allocated")
      .order("registration_date", { ascending: false })

    if (error) {
      console.error("Error fetching allocated units:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch allocated units",
          details: error.message
        },
        { status: 500 }
      )
    }

    // Format the response
    const allocatedUnits = allocations?.map(allocation => ({
      allocation_id: allocation.id,
      unit_id: allocation.units.id,
      unit_name: allocation.units.unit_name,
      unit_code: allocation.units.unit_code,
      description: allocation.units.description,
      credits: allocation.units.credits,
      allocated_at: allocation.registration_date
    })) || []

    return NextResponse.json({
      student_id: studentId,
      allocated_units: allocatedUnits,
      total_allocated: allocatedUnits.length
    })

  } catch (error) {
    console.error("Error in get allocated units:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
