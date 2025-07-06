import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: Promise<{ regNumber: string }> }) {
  try {
    const { regNumber } = await params
    const registrationNumber = regNumber

    if (!registrationNumber) {
      return NextResponse.json({ error: "Registration number is required" }, { status: 400 })
    }

    // Fetch documents for the student
    const { data: documents, error } = await supabase
      .from("student_documents")
      .select("*")
      .eq("registration_number", registrationNumber)
      .order("uploaded_at", { ascending: false })

    if (error) {
      console.error("Database query error:", error)
      return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      documents: documents || []
    })
  } catch (error) {
    console.error("Error fetching student documents:", error)
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    )
  }
}