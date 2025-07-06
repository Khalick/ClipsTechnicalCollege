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

    // Fetch clearance progress for the student
    const { data: progressData, error: progressError } = await supabase
      .from("clearance_dashboard")
      .select("*")
      .eq("registration_number", registrationNumber)
      .order("department")

    if (progressError) {
      console.error("Error fetching clearance progress:", progressError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch clearance progress",
      }, { status: 500 })
    }

    // Calculate overall progress
    const totalDepartments = progressData?.length || 0
    const completedDepartments = progressData?.filter(dept => dept.status === "completed").length || 0
    const overallProgress = totalDepartments > 0 ? Math.round((completedDepartments / totalDepartments) * 100) : 0

    return NextResponse.json({
      success: true,
      data: {
        departments: progressData || [],
        summary: {
          total_departments: totalDepartments,
          completed_departments: completedDepartments,
          pending_departments: progressData?.filter(dept => dept.status === "pending").length || 0,
          in_progress_departments: progressData?.filter(dept => dept.status === "in-progress").length || 0,
          overall_progress: overallProgress
        }
      },
      message: "Clearance progress retrieved successfully"
    })

  } catch (error) {
    console.error("Error in clearance progress API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { registrationNumber, department, action, notes } = body

    if (!registrationNumber || !department || !action) {
      return NextResponse.json({
        success: false,
        message: "Registration number, department, and action are required",
      }, { status: 400 })
    }

    // Update clearance record based on action
    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (action === "complete") {
      updateData.status = "completed"
      updateData.cleared_date = new Date().toISOString()
      updateData.progress_percentage = 100
      updateData.pending_requirements = []
    } else if (action === "start") {
      updateData.status = "in-progress"
      updateData.progress_percentage = 50
    } else if (action === "reset") {
      updateData.status = "pending"
      updateData.progress_percentage = 0
      updateData.cleared_date = null
      updateData.cleared_by = null
    }

    if (notes) {
      updateData.notes = notes
    }

    // Update clearance record
    const { data: updatedData, error: updateError } = await supabase
      .from("clearance_records")
      .update(updateData)
      .eq("registration_number", registrationNumber)
      .eq("department", department)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating clearance progress:", updateError)
      return NextResponse.json({
        success: false,
        message: "Failed to update clearance progress",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedData,
      message: "Clearance progress updated successfully"
    })

  } catch (error) {
    console.error("Error in clearance progress API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}
