import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key"

export async function POST(request: NextRequest) {
  try {
    const { student_id, new_password } = await request.json()

    if (!student_id || !new_password) {
      return NextResponse.json({ 
        error: "Student ID and new password are required" 
      }, { status: 400 })
    }

    if (new_password.length < 6) {
      return NextResponse.json({ 
        error: "Password must be at least 6 characters long" 
      }, { status: 400 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10)

    // Update the student's password in the database
    const { data: updatedStudent, error } = await supabaseAdmin
      .from("students")
      .update({ 
        password: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq("id", student_id)
      .select()
      .single()

    if (error || !updatedStudent) {
      console.error("Password update error:", error)
      return NextResponse.json({ 
        error: "Failed to update password" 
      }, { status: 500 })
    }

    // Generate a new JWT token
    const token = jwt.sign(
      {
        studentId: updatedStudent.id,
        registrationNumber: updatedStudent.registration_number,
        type: "student",
      },
      SECRET_KEY,
      { expiresIn: "24h" },
    )

    return NextResponse.json({
      success: true,
      message: "Password updated successfully",
      token,
      student: {
        id: updatedStudent.id,
        name: updatedStudent.name,
        registration_number: updatedStudent.registration_number,
        course: updatedStudent.course,
        level_of_study: updatedStudent.level_of_study,
        email: updatedStudent.email
      }
    })

  } catch (error) {
    console.error("Student password update error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      message: "An error occurred while updating your password. Please try again."
    }, { status: 500 })
  }
}
