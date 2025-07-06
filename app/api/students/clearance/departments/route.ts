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

    // Fetch all clearance departments with their requirements
    const { data: departmentsData, error: departmentsError } = await supabase
      .from("clearance_departments")
      .select(`
        *,
        clearance_requirements (
          id,
          requirement_name,
          requirement_description,
          is_mandatory,
          documents_needed,
          estimated_processing_days
        )
      `)
      .eq("is_active", true)
      .order("name")

    if (departmentsError) {
      console.error("Error fetching clearance departments:", departmentsError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch clearance departments",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: departmentsData || [],
      message: "Clearance departments retrieved successfully"
    })

  } catch (error) {
    console.error("Error in clearance departments API:", error)
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
    const { name, department_type, description, contact_person, contact_email, contact_phone, office_location } = body

    if (!name || !department_type) {
      return NextResponse.json({
        success: false,
        message: "Department name and type are required",
      }, { status: 400 })
    }

    const departmentData = {
      name,
      department_type,
      description,
      contact_person,
      contact_email,
      contact_phone,
      office_location,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert clearance department
    const { data: insertedData, error: insertError } = await supabase
      .from("clearance_departments")
      .insert(departmentData)
      .select()
      .single()

    if (insertError) {
      console.error("Error creating clearance department:", insertError)
      return NextResponse.json({
        success: false,
        message: "Failed to create clearance department",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: insertedData,
      message: "Clearance department created successfully"
    })

  } catch (error) {
    console.error("Error in clearance departments API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}
