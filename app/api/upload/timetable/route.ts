import { type NextRequest, NextResponse } from "next/server"
import { handleFileUpload } from "@/lib/file-upload"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const registrationNumber = formData.get("registrationNumber") || formData.get("registration_number")
    const file = formData.get("file") || formData.get("timetable")

    if (!registrationNumber || typeof registrationNumber !== "string") {
      return NextResponse.json({ error: "Registration number is required" }, { status: 400 })
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 })
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const result = await handleFileUpload(registrationNumber.trim(), file, "timetable")

    return NextResponse.json({
      message: "Timetable uploaded successfully",
      ...result,
    }, { status: 201 })
  } catch (error) {
    return NextResponse.json({
      error: "Failed to upload timetable",
      details: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 })
  }
}