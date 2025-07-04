import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function POST(request: NextRequest) {
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

    const { student_id, unit_ids } = await request.json()

    if (!student_id || !unit_ids || !Array.isArray(unit_ids) || unit_ids.length === 0) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Student ID and unit IDs array are required"
        },
        { status: 400 }
      )
    }

    // Verify student exists and is active
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, name, registration_number, status")
      .eq("id", student_id)
      .single()

    if (studentError || !student) {
      return NextResponse.json(
        {
          error: "Student not found",
          details: "The specified student does not exist"
        },
        { status: 404 }
      )
    }

    if (student.status !== "active") {
      return NextResponse.json(
        {
          error: "Student not active",
          details: "Only active students can register for units"
        },
        { status: 403 }
      )
    }

    // Check if units are allocated to this student (status = 'allocated' in student_units)
    const { data: allocatedUnits, error: allocationError } = await supabase
      .from("student_units")
      .select(`
        unit_id,
        units!inner(
          id,
          unit_name,
          unit_code
        )
      `)
      .eq("student_id", student_id)
      .eq("status", "allocated")
      .in("unit_id", unit_ids)

    if (allocationError) {
      return NextResponse.json(
        {
          error: "Error checking allocations",
          details: allocationError.message
        },
        { status: 500 }
      )
    }

    const allocatedUnitIds = allocatedUnits?.map(a => a.unit_id) || []
    const notAllocatedUnits = unit_ids.filter(id => !allocatedUnitIds.includes(parseInt(id)))

    if (notAllocatedUnits.length > 0) {
      return NextResponse.json(
        {
          error: "Units not allocated",
          details: `Some units are not allocated to this student: ${notAllocatedUnits.join(", ")}`
        },
        { status: 403 }
      )
    }

    // Check for units that are already registered
    const { data: alreadyRegistered } = await supabase
      .from("student_units")
      .select("unit_id")
      .eq("student_id", student_id)
      .eq("status", "registered")
      .in("unit_id", unit_ids)

    const alreadyRegisteredIds = alreadyRegistered?.map(r => r.unit_id) || []
    const unitsToRegister = unit_ids.filter(id => !alreadyRegisteredIds.includes(parseInt(id)))

    if (unitsToRegister.length === 0) {
      return NextResponse.json(
        {
          error: "Units already registered",
          details: "All selected units are already registered"
        },
        { status: 409 }
      )
    }

    // Update allocated units to registered status
    const { data: updatedRegistrations, error: registrationError } = await supabase
      .from("student_units")
      .update({ status: "registered" })
      .eq("student_id", student_id)
      .eq("status", "allocated")
      .in("unit_id", unitsToRegister)
      .select(`
        *,
        units!inner(unit_name, unit_code, credits)
      `)

    if (registrationError) {
      console.error("Error creating registrations:", registrationError)
      return NextResponse.json(
        {
          error: "Failed to register for units",
          details: registrationError.message
        },
        { status: 500 }
      )
    }

    // Prepare response
    const registeredUnitsInfo = updatedRegistrations?.map((registration: any) => ({
      unit_id: registration.unit_id,
      unit_name: registration.units.unit_name,
      unit_code: registration.units.unit_code,
      credits: registration.units.credits,
      registration_date: registration.registration_date
    })) || []

    return NextResponse.json({
      message: "Unit registration successful",
      student: {
        id: student.id,
        name: student.name,
        registration_number: student.registration_number
      },
      registered_units: registeredUnitsInfo,
      summary: {
        total_requested: unit_ids.length,
        newly_registered: unitsToRegister.length,
        already_registered: alreadyRegisteredIds.length
      }
    })

  } catch (error) {
    console.error("Error in unit registration:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
