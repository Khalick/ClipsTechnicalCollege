import { type NextRequest, NextResponse } from "next/server"
import { handleFileUpload } from "@/lib/file-upload"

export async function POST(request: NextRequest) {
  try {
    console.log("Exam card upload request received")

    const formData = await request.formData()

    const registrationNumber =
      formData.get("registrationNumber") ||
      formData.get("registration_number") ||
      formData.get("regNumber") ||
      formData.get("reg_number")

    const file =
      formData.get("file") || formData.get("examCard") || formData.get("exam_card") || formData.get("document")

    if (!registrationNumber || typeof registrationNumber !== "string") {
      return NextResponse.json(
        {
          error: "Registration number is required",
          details: "Please provide registrationNumber field in FormData",
          receivedFields: [...formData.keys()],
        },
        { status: 400 },
      )
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        {
          error: "File is required",
          details: "Please provide a valid file in FormData",
          receivedFields: [...formData.keys()],
        },
        { status: 400 },
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error: "File size must be less than 10MB",
          actualSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        },
        { status: 400 },
      )
    }

    if (file.size < 1024) {
      return NextResponse.json(
        {
          error: "File appears to be empty or too small",
          actualSize: `${file.size} bytes`,
        },
        { status: 400 },
      )
    }

    const result = await handleFileUpload(registrationNumber.trim(), file, "exam-card")

    return NextResponse.json(
      {
        message: "Exam card uploaded successfully",
        ...result,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Exam card upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload exam card",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
