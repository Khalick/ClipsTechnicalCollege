import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET() {
  try {
    console.log("Fetching all units")

    const { data, error } = await supabase
      .from("units")
      .select("*")
      .order("unit_code")

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch units",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Successfully fetched ${data.length} units`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching units:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch units",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Create unit request:", body)

    const { unit_name, unit_code } = body

    if (!unit_name || !unit_code) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Unit name and unit code are required",
        },
        { status: 400 },
      )
    }

    // Check if unit already exists
    const { data: existingUnits } = await supabase
      .from("units")
      .select("id")
      .eq("unit_code", unit_code)

    if (existingUnits && existingUnits.length > 0) {
      return NextResponse.json(
        {
          error: "Unit already exists",
          details: `A unit with code '${unit_code}' already exists`,
        },
        { status: 409 },
      )
    }

    // Insert new unit
    const { data, error } = await supabase
      .from("units")
      .insert({ unit_name, unit_code })
      .select()
      .single()

    if (error) {
      console.error("Database insertion error:", error)
      return NextResponse.json(
        {
          error: "Failed to create unit",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("Unit created successfully")
    return NextResponse.json({
      message: "Unit created successfully",
      unit: data,
    })
  } catch (error) {
    console.error("Error creating unit:", error)
    return NextResponse.json(
      {
        error: "Failed to create unit",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
