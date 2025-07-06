import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client"
import { verifyToken } from "@/lib/auth"
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const registrationNumber = searchParams.get("registrationNumber")

    if (!registrationNumber) {
      return NextResponse.json({ 
        success: false, 
        message: "Registration number is required" 
      }, { status: 400 })
    }

    // Fetch available lecturers for evaluation
    const { data: lecturers, error } = await supabaseAdmin
      .from("lecturer_evaluations")
      .select(`
        *,
        lecturer_name,
        unit_name,
        unit_code,
        semester,
        academic_year,
        evaluation_status,
        evaluation_period_start,
        evaluation_period_end
      `)
      .eq("registration_number", registrationNumber)
      .eq("evaluation_active", true)
      .order("lecturer_name", { ascending: true })

    if (error) {
      console.error("Error fetching lecturer evaluations:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Error fetching lecturer evaluations" 
      }, { status: 500 })
    }

    // If no evaluations available, return empty with message
    if (!lecturers || lecturers.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No lecturer evaluations available at this time"
      })
    }

    return NextResponse.json({
      success: true,
      data: lecturers,
      message: "Lecturer evaluations retrieved successfully"
    })

  } catch (error) {
    console.error("Error in lecturer evaluation API:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const result = await verifyToken(request)
    if (!result.success || !result.user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    // Type guard to ensure user has the expected properties
    if (typeof result.user === 'string' || !('registrationNumber' in result.user)) {
      return NextResponse.json({ success: false, message: "Invalid user data" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      lecturer_id, 
      unit_code, 
      ratings, 
      comments, 
      overall_rating 
    } = body

    if (!lecturer_id || !unit_code || !ratings || !overall_rating) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required evaluation data" 
      }, { status: 400 })
    }

    // Submit lecturer evaluation
    const { data, error } = await supabaseAdmin
      .from("lecturer_evaluation_responses")
      .insert([
        {
          registration_number: result.user.registrationNumber,
          lecturer_id,
          unit_code,
          ratings: JSON.stringify(ratings),
          comments,
          overall_rating,
          submitted_at: new Date().toISOString(),
          academic_year: new Date().getFullYear(),
          semester: Math.ceil((new Date().getMonth() + 1) / 6) // Simple semester calculation
        }
      ])

    if (error) {
      console.error("Error submitting lecturer evaluation:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Error submitting evaluation" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Lecturer evaluation submitted successfully"
    })

  } catch (error) {
    console.error("Error in lecturer evaluation submission:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
