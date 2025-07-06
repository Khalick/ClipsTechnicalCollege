import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { supabaseAdmin } from "@/lib/supabase-client"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 })
    }

    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const registrationNumber = searchParams.get("registrationNumber") || user.registrationNumber

    // Fetch student's academic requisitions
    const { data: requisitions, error } = await supabaseAdmin
      .from("academic_requisitions")
      .select(`
        *,
        requisition_type,
        document_type,
        status,
        requested_date,
        processed_date,
        fee_amount,
        payment_status,
        collection_date,
        notes
      `)
      .eq("registration_number", registrationNumber)
      .order("requested_date", { ascending: false })

    if (error) {
      console.error("Error fetching academic requisitions:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Error fetching academic requisitions" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: requisitions || [],
      message: "Academic requisitions retrieved successfully"
    })

  } catch (error) {
    console.error("Error in academic requisitions API:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 401 })
    }

    const user = await verifyToken(request)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { 
      requisition_type, 
      document_type, 
      copies_requested = 1,
      delivery_method = "collection",
      notes = ""
    } = body

    if (!requisition_type || !document_type) {
      return NextResponse.json({ 
        success: false, 
        message: "Missing required requisition data" 
      }, { status: 400 })
    }

    // Calculate fee based on document type
    const feeMap = {
      "transcript": 1000,
      "certificate": 500,
      "recommendation_letter": 300,
      "verification_letter": 200,
      "course_outline": 100
    }

    const fee_amount = (feeMap[document_type as keyof typeof feeMap] || 500) * copies_requested

    // Submit academic requisition
    const { data, error } = await supabaseAdmin
      .from("academic_requisitions")
      .insert([
        {
          registration_number: user.registrationNumber,
          requisition_type,
          document_type,
          copies_requested,
          delivery_method,
          notes,
          fee_amount,
          status: "pending",
          payment_status: "pending",
          requested_date: new Date().toISOString(),
          reference_number: `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        }
      ])

    if (error) {
      console.error("Error submitting academic requisition:", error)
      return NextResponse.json({ 
        success: false, 
        message: "Error submitting requisition" 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data,
      message: "Academic requisition submitted successfully"
    })

  } catch (error) {
    console.error("Error in academic requisition submission:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Internal server error" 
    }, { status: 500 })
  }
}
