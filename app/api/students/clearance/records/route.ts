import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { searchParams } = new URL(request.url)
    const registrationNumber = searchParams.get("registrationNumber")

    if (!registrationNumber) {
      return NextResponse.json({
        success: false,
        message: "Registration number is required",
      }, { status: 400 })
    }

    // Fetch clearance records for the student
    const { data: clearanceData, error: clearanceError } = await supabase
      .from("clearance_records")
      .select("*")
      .eq("registration_number", registrationNumber)
      .order("created_at", { ascending: false })

    if (clearanceError) {
      console.error("Error fetching clearance records:", clearanceError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch clearance records",
      }, { status: 500 })
    }

    // If no records exist, create default department clearance records
    if (!clearanceData || clearanceData.length === 0) {
      const defaultDepartments = [
        {
          registration_number: registrationNumber,
          department: "Library",
          department_type: "academic",
          status: "pending",
          requirements: ["Return all borrowed books", "Pay outstanding library fines"],
          pending_requirements: ["Return all borrowed books", "Pay outstanding library fines"]
        },
        {
          registration_number: registrationNumber,
          department: "Finance",
          department_type: "administrative",
          status: "pending",
          requirements: ["Clear all fee balances", "Return student ID card"],
          pending_requirements: ["Clear all fee balances"]
        },
        {
          registration_number: registrationNumber,
          department: "IT Department",
          department_type: "technical",
          status: "pending",
          requirements: ["Return all IT equipment", "Clear network access"],
          pending_requirements: ["Return all IT equipment"]
        },
        {
          registration_number: registrationNumber,
          department: "Academic Office",
          department_type: "academic",
          status: "pending",
          requirements: ["Submit all coursework", "Complete evaluation forms"],
          pending_requirements: ["Submit all coursework", "Complete evaluation forms"]
        },
        {
          registration_number: registrationNumber,
          department: "Hostel Office",
          department_type: "accommodation",
          status: "pending",
          requirements: ["Clear hostel fees", "Return room keys", "Complete room inspection"],
          pending_requirements: ["Clear hostel fees", "Return room keys"]
        }
      ]

      // Insert default records
      const { data: insertedData, error: insertError } = await supabase
        .from("clearance_records")
        .insert(defaultDepartments)
        .select()

      if (insertError) {
        console.error("Error creating default clearance records:", insertError)
        return NextResponse.json({
          success: false,
          message: "Failed to create clearance records",
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        data: insertedData,
        message: "Clearance records retrieved successfully"
      })
    }

    return NextResponse.json({
      success: true,
      data: clearanceData,
      message: "Clearance records retrieved successfully"
    })

  } catch (error) {
    console.error("Error in clearance records API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}
