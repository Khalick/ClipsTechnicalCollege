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

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id, name, registration_number, course")
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

    // Verify all units exist
    const { data: units, error: unitsError } = await supabase
      .from("units")
      .select("id, unit_name, unit_code")
      .in("id", unit_ids)

    if (unitsError || !units || units.length !== unit_ids.length) {
      return NextResponse.json(
        {
          error: "Invalid units",
          details: "One or more specified units do not exist"
        },
        { status: 404 }
      )
    }

    // Check for existing allocations (units with status 'allocated' or 'registered')
    const { data: existingAllocations } = await supabase
      .from("student_units")
      .select("unit_id")
      .eq("student_id", student_id)
      .in("unit_id", unit_ids)

    const alreadyAllocatedUnits = existingAllocations?.map(a => a.unit_id) || []
    const newUnitIds = unit_ids.filter(id => !alreadyAllocatedUnits.includes(id))

    if (newUnitIds.length === 0) {
      return NextResponse.json(
        {
          error: "Units already allocated",
          details: "All selected units are already allocated to this student"
        },
        { status: 409 }
      )
    }

    // Create allocation records in student_units table with status 'allocated'
    const allocations = newUnitIds.map(unit_id => ({
      student_id: parseInt(student_id),
      unit_id: parseInt(unit_id),
      status: "allocated"
    }))

    const { data: createdAllocations, error: allocationError } = await supabase
      .from("student_units")
      .insert(allocations)
      .select(`
        *,
        units!inner(unit_name, unit_code)
      `)

    if (allocationError) {
      console.error("Error creating allocations:", allocationError)
      return NextResponse.json(
        {
          error: "Failed to allocate units",
          details: allocationError.message
        },
        { status: 500 }
      )
    }

    // Prepare response
    const allocatedUnitsInfo = createdAllocations?.map(allocation => ({
      unit_id: allocation.unit_id,
      unit_name: allocation.units.unit_name,
      unit_code: allocation.units.unit_code
    })) || []

    const skippedUnitsInfo = alreadyAllocatedUnits.length > 0 
      ? units.filter(u => alreadyAllocatedUnits.includes(parseInt(u.id)))
      : []

    return NextResponse.json({
      message: "Units allocated successfully",
      student: {
        id: student.id,
        name: student.name,
        registration_number: student.registration_number,
        course: student.course
      },
      allocated_units: allocatedUnitsInfo,
      skipped_units: skippedUnitsInfo,
      summary: {
        total_requested: unit_ids.length,
        newly_allocated: newUnitIds.length,
        already_allocated: alreadyAllocatedUnits.length
      }
    })

  } catch (error) {
    console.error("Error in unit allocation:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
