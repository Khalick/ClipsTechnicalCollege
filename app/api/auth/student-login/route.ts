/**
 * Student Login API Route
 * 
 * This route handles student authentication using an age-based password system:
 * - Students 18 years and older: use National ID as password
 * - Students under 18 years: use Birth Certificate number as password
 * 
 * The system automatically determines which field to use based on the student's age
 * calculated from their date of birth.
 */

import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { supabase } from "@/lib/db"

const SECRET_KEY = process.env.SECRET_KEY || "your-secret-key"

// Mock student data - replace with actual database
const students = [
  {
    id: "1",
    name: "John Doe",
    registration_number: "CS/001/2024",
    national_id: "12345678",
    birth_certificate: "BC123456",
    date_of_birth: "1995-01-01", // 29 years old - should use national_id
    course: "Computer Science",
    level_of_study: "Year 2 Semester 1",
    status: "active",
    deregistered: false,
  },
  {
    id: "2",
    name: "Jane Smith",
    registration_number: "CS/002/2024",
    national_id: "87654321",
    birth_certificate: "BC789012",
    date_of_birth: "2008-05-15", // 16 years old - should use birth_certificate
    course: "Information Technology",
    level_of_study: "Year 1 Semester 2",
    status: "active",
    deregistered: false,
  },
  {
    id: "3",
    name: "Mike Johnson",
    registration_number: "CS/003/2024",
    national_id: "11223344",
    birth_certificate: "BC345678",
    date_of_birth: "2006-12-01", // 17 years old - should use birth_certificate
    course: "Software Engineering",
    level_of_study: "Year 1 Semester 1",
    status: "active",
    deregistered: false,
  },
]

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
      return NextResponse.json({ error: "Registration number and password are required" }, { status: 400 })
    }

    // Try to find student in database first
    let student = null
    if (supabase) {
      const { data: dbStudent, error } = await supabase
        .from("students")
        .select("*")
        .eq("registration_number", registration_number)
        .single()

      student = dbStudent
    }

    // If not found in database, check mock data
    if (!student) {
      student = students.find((s) => s.registration_number === registration_number)
    }

    if (!student) {
      return NextResponse.json({ 
        error: "Student not found", 
        message: "Please check your registration number and try again"
      }, { status: 401 })
    }

    // Check if student is deregistered
    if (student.deregistered) {
      return NextResponse.json({ 
        error: "Account deregistered", 
        message: "Your account has been deregistered. Please contact the administration for assistance."
      }, { status: 403 })
    }

    // Determine which field to use as password based on age
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

    // Remove sensitive data from response
    const { national_id, birth_certificate, ...studentData } = student

    return NextResponse.json({
      token,
      student: studentData,
      student_id: student.id,
      name: student.name,
      registration_number: student.registration_number,
      first_login: student.first_login || false,
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
