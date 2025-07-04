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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const studentId = params.id
    console.log("Updating student:", studentId)

    const contentType = request.headers.get("content-type") || ""
    let studentData: any = {}
    let photoUrl: string | null = null

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      studentData = {
        name: formData.get("name")?.toString(),
        registration_number: formData.get("registration_number")?.toString(),
        email: formData.get("email")?.toString(),
        course: formData.get("course")?.toString(),
        level_of_study: formData.get("level_of_study")?.toString(),
        national_id: formData.get("national_id")?.toString() || null,
        birth_certificate: formData.get("birth_certificate")?.toString() || null,
        date_of_birth: formData.get("date_of_birth")?.toString() || null,
        status: formData.get("status")?.toString() || "active",
      }

      const photoFile = formData.get("photo") as File
      if (photoFile && photoFile.size > 0) {
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
      studentData = await request.json()
    }

    // Validate required fields
    if (
      !studentData.name ||
      !studentData.registration_number ||
      !studentData.course ||
      !studentData.level_of_study
    ) {
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

    // Update student using Supabase
    const updateData: any = {
      name: studentData.name,
      registration_number: studentData.registration_number,
      course: studentData.course,
      level_of_study: studentData.level_of_study,
      national_id: studentData.national_id,
      birth_certificate: studentData.birth_certificate,
      date_of_birth: studentData.date_of_birth,
      email: studentData.email,
      status: studentData.status || "active",
    }

    if (photoUrl) {
      updateData.photo_url = photoUrl
    }

    const { data, error } = await supabase
      .from("students")
      .update(updateData)
      .eq("id", studentId)
      .select()
      .single()

    if (error) {
      console.error("Database update error:", error)
      return NextResponse.json(
        {
          error: "Failed to update student",
          details: error.message,
        },
        { status: 500 },
      )
    }

    if (!data) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        student: data,
      },
    })
  } catch (error) {
    console.error("Error updating student:", error)
    return NextResponse.json(
      {
        error: "Failed to update student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
