import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { supabaseAdmin } from "@/lib/supabase-client"

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key"

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

export async function POST(request: NextRequest) {
  try {
    const { registration_number, password } = await request.json()

    if (!registration_number || !password) {
      return NextResponse.json({ 
        error: "Registration number and password are required" 
      }, { status: 400 })
    }

    // Find student in database
    const { data: student, error } = await supabaseAdmin
      .from("students")
      .select("*")
      .eq("registration_number", registration_number)
      .single()

    if (error || !student) {
      return NextResponse.json({ 
        error: "Student not found", 
        message: "Please check your registration number and try again"
      }, { status: 401 })
    }

    // Check if student is deregistered
    if (student.deregistered || student.status !== 'active') {
      return NextResponse.json({ 
        error: "Account inactive", 
        message: "Your account is inactive. Please contact the administration for assistance."
      }, { status: 403 })
    }

    // Check if this is first login (no password set)
    if (!student.password) {
      // For first login, verify using age-based authentication
      const age = calculateAge(student.date_of_birth)
      const isAdult = age >= 18
      const expectedPassword = isAdult ? student.national_id : student.birth_certificate
      const passwordType = isAdult ? "National ID" : "Birth Certificate"

      if (!expectedPassword) {
        return NextResponse.json({ 
          error: "Authentication information missing", 
          message: `Your ${passwordType} is not on file. Please contact administration.`
        }, { status: 401 })
      }

      if (expectedPassword !== password) {
        return NextResponse.json({ 
          error: "Invalid credentials", 
          message: `Please enter your ${passwordType} number as your password`
        }, { status: 401 })
      }

      // Generate JWT token for first login
      const token = jwt.sign(
        {
          studentId: student.id,
          registrationNumber: student.registration_number,
          type: "student",
        },
        SECRET_KEY,
        { expiresIn: "24h" },
      )

      return NextResponse.json({
        token,
        student: {
          id: student.id,
          name: student.name,
          registration_number: student.registration_number,
          course: student.course,
          level_of_study: student.level_of_study,
          email: student.email
        },
        first_login: true,
        requires_password_reset: true,
        message: "First time login detected. Please set a new password."
      })
    } else {
      // For subsequent logins, verify against stored password
      const isValidPassword = await bcrypt.compare(password, student.password)
      
      if (!isValidPassword) {
        return NextResponse.json({ 
          error: "Invalid credentials", 
          message: "Incorrect password. Please try again."
        }, { status: 401 })
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          studentId: student.id,
          registrationNumber: student.registration_number,
          type: "student",
        },
        SECRET_KEY,
        { expiresIn: "24h" },
      )

      return NextResponse.json({
        token,
        student: {
          id: student.id,
          name: student.name,
          registration_number: student.registration_number,
          course: student.course,
          level_of_study: student.level_of_study,
          email: student.email
        },
        first_login: false,
      })
    }
  } catch (error) {
    console.error("Student login error:", error)
    return NextResponse.json({ 
      error: "Internal server error",
      message: "An error occurred during login. Please try again."
    }, { status: 500 })
  }
}
