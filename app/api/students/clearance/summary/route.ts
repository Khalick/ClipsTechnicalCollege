import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.SUPABASE_URL!,
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

    // Fetch clearance summary for the student
    const { data: summaryData, error: summaryError } = await supabase
      .from("clearance_summary")
      .select("*")
      .eq("registration_number", registrationNumber)
      .single()

    if (summaryError) {
      console.error("Error fetching clearance summary:", summaryError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch clearance summary",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: summaryData || {
        registration_number: registrationNumber,
        total_departments: 0,
        completed_departments: 0,
        pending_departments: 0,
        in_progress_departments: 0,
        completion_percentage: 0
      },
      message: "Clearance summary retrieved successfully"
    })

  } catch (error) {
    console.error("Error in clearance summary API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}
