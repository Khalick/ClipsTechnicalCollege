import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import { uploadFileToSupabase } from "@/lib/storage"

// Helper function to calculate age
function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export async function GET(request: NextRequest) {
  try {
    console.log("Fetching students")

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")

    let query = supabase.from("students").select("*")

    if (status) {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Database error:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch students",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log(`Successfully fetched ${data.length} students`)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching students:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch students",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("Creating new student")
    let studentData: any = {}
    let photoUrl: string | null = null

    const contentType = request.headers.get("content-type") || ""

    if (contentType.includes("multipart/form-data")) {
      // Handle multipart form data
      const formData = await request.formData()

      studentData = {
        name: formData.get("name")?.toString(),
        registration_number: formData.get("registration_number")?.toString(),
        course: formData.get("course")?.toString(),
        level_of_study: formData.get("level_of_study")?.toString(),
        national_id: formData.get("national_id")?.toString() || null,
        birth_certificate: formData.get("birth_certificate")?.toString() || null,
        date_of_birth: formData.get("date_of_birth")?.toString() || null,
        email: formData.get("email")?.toString() || null,
      }

      // Handle photo upload
      const photoFile = formData.get("photo") as File
      if (photoFile && photoFile.size > 0) {
        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
        if (!allowedTypes.includes(photoFile.type)) {
          return NextResponse.json(
            {
              error: "Invalid photo type",
              details: "Photo must be JPEG, JPG, PNG, or GIF format",
            },
            { status: 400 },
          )
        }

        if (photoFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            {
              error: "Photo file too large",
              details: "Photo must be less than 5MB",
            },
            { status: 400 },
          )
        }

        try {
          const uploadResult = await uploadFileToSupabase(
            photoFile,
            "photos",
            `student_${studentData.registration_number}`,
          )
          photoUrl = uploadResult.publicUrl
        } catch (uploadError) {
          return NextResponse.json(
            {
              error: "Photo upload failed",
              details: uploadError instanceof Error ? uploadError.message : "Upload failed",
            },
            { status: 500 },
          )
        }
      }
    } else {
      // Handle JSON request
      studentData = await request.json()
    }

    // Validate required fields
    if (!studentData.name || !studentData.registration_number || !studentData.course || !studentData.level_of_study) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Name, registration number, course, and level of study are required",
        },
        { status: 400 },
      )
    }

    // Age-based validation for authentication fields
    if (studentData.date_of_birth) {
      const age = calculateAge(studentData.date_of_birth)
      if (age >= 18 && !studentData.national_id) {
        return NextResponse.json(
          {
            error: "National ID required",
            details: "National ID is required for students 18 years and older",
          },
          { status: 400 },
        )
      }
      if (age < 18 && !studentData.birth_certificate) {
        return NextResponse.json(
          {
            error: "Birth certificate required",
            details: "Birth certificate is required for students under 18 years",
          },
          { status: 400 },
        )
      }
    }

    // Check if student already exists
    const { data: existingStudents } = await supabase
      .from("students")
      .select("id")
      .eq("registration_number", studentData.registration_number)

    if (existingStudents && existingStudents.length > 0) {
      return NextResponse.json(
        {
          error: "Student already exists",
          details: `A student with registration number '${studentData.registration_number}' already exists`,
        },
        { status: 409 },
      )
    }

    // Insert student
    const { data, error } = await supabase
      .from("students")
      .insert({
        name: studentData.name,
        registration_number: studentData.registration_number,
        course: studentData.course,
        level_of_study: studentData.level_of_study,
        national_id: studentData.national_id,
        birth_certificate: studentData.birth_certificate,
        date_of_birth: studentData.date_of_birth,
        photo_url: photoUrl,
        email: studentData.email,
        status: "active",
      })
      .select()
      .single()

    if (error) {
      console.error("Database insertion error:", error)
      return NextResponse.json(
        {
          error: "Failed to create student",
          details: error.message,
        },
        { status: 500 },
      )
    }

    console.log("Student created successfully:", data.id)

    return NextResponse.json(
      {
        message: "Student created successfully",
        student: data,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating student:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
