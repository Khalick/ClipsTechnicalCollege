import { type NextRequest, NextResponse } from "next/server"
import { handleFileUpload } from "@/lib/file-upload"

export async function POST(request: NextRequest) {
  try {
    console.log("Fees structure upload request received")

    const formData = await request.formData()

    const registrationNumber =
      formData.get("registrationNumber") || formData.get("registration_number") || formData.get("regNumber")

    const file =
      formData.get("file") ||
      formData.get("feesStructure") ||
      formData.get("fees_structure") ||
      formData.get("document")

    if (!registrationNumber || typeof registrationNumber !== "string") {
      return NextResponse.json(
        {
          error: "Registration number is required",
          receivedFields: [...formData.keys()],
        },
        { status: 400 },
      )
    }

    if (!file || !(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        {
          error: "Valid file is required",
          receivedFields: [...formData.keys()],
        },
        { status: 400 },
      )
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 10MB" }, { status: 400 })
    }

    const result = await handleFileUpload(registrationNumber.trim(), file, "fees-structure")

    return NextResponse.json(
      {
        message: "Fees structure uploaded successfully",
        ...result,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Fees structure upload error:", error)
    return NextResponse.json(
      {
        error: "Failed to upload fees structure",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
