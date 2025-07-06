import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client"

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

    // Fetch provisional results for the student
    const { data: results, error } = await supabaseAdmin
      .from("provisional_results")
      .select(`
        *,
        unit_name,
        unit_code,
        semester,
        academic_year,
        grade,
        marks,
        exam_date
      `)
      .eq("registration_number", registrationNumber)
      .order("academic_year", { ascending: false })
      .order("semester", { ascending: false })

    if (error) {
      console.error("Error fetching provisional results:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Error fetching provisional results" 
      }, { status: 500 })
    }

    // If no results table exists, return empty results with message
    if (!results || results.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "No provisional results available at this time"
      })
    }

    return NextResponse.json({
      success: true,
      data: results,
      message: "Provisional results retrieved successfully"
    })

  } catch (error) {
    console.error("Error in provisional results API:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
