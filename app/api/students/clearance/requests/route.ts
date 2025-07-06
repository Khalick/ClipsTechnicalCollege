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

    // Fetch clearance requests for the student
    const { data: requestsData, error: requestsError } = await supabase
      .from("clearance_requests")
      .select("*")
      .eq("registration_number", registrationNumber)
      .order("created_at", { ascending: false })

    if (requestsError) {
      console.error("Error fetching clearance requests:", requestsError)
      return NextResponse.json({
        success: false,
        message: "Failed to fetch clearance requests",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: requestsData || [],
      message: "Clearance requests retrieved successfully"
    })

  } catch (error) {
    console.error("Error in clearance requests API:", error)
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

    const body = await request.json()
    const { registrationNumber, requestType, requestReason, priority = "normal" } = body

    if (!registrationNumber || !requestType || !requestReason) {
      return NextResponse.json({
        success: false,
        message: "Registration number, request type, and reason are required",
      }, { status: 400 })
    }

    // Determine required documents based on request type
    const getRequiredDocuments = (type: string) => {
      switch (type) {
        case "academic":
          return ["Academic transcript", "Coursework completion certificate", "Evaluation forms"]
        case "financial":
          return ["Fee statement", "Payment receipts", "Refund application"]
        case "library":
          return ["Library card", "Book return receipt", "Fine clearance form"]
        case "hostel":
          return ["Room inspection report", "Key return receipt", "Damage assessment report"]
        case "general":
          return ["General clearance form", "Supporting documents"]
        case "graduation":
          return ["Academic clearance", "Financial clearance", "Library clearance", "Security clearance"]
        case "transfer":
          return ["Academic transcript", "Transfer letter", "Clearance certificates"]
        case "withdrawal":
          return ["Withdrawal letter", "Fee clearance", "Library clearance", "Academic clearance"]
        default:
          return ["Basic documentation"]
      }
    }

    const requestData = {
      registration_number: registrationNumber,
      request_type: requestType,
      request_reason: requestReason,
      status: "pending",
      priority: priority,
      documents_required: getRequiredDocuments(requestType),
      documents_submitted: [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert clearance request
    const { data: insertedData, error: insertError } = await supabase
      .from("clearance_requests")
      .insert(requestData)
      .select()
      .single()

    if (insertError) {
      console.error("Error creating clearance request:", insertError)
      return NextResponse.json({
        success: false,
        message: "Failed to create clearance request",
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: insertedData,
      message: "Clearance request submitted successfully"
    })

  } catch (error) {
    console.error("Error in clearance requests API:", error)
    return NextResponse.json({
      success: false,
      message: "Internal server error",
    }, { status: 500 })
  }
}
