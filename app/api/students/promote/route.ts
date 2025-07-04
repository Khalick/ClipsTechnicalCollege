import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Student promotion request received:", body)

    const { registration_number, new_level } = body

    if (!registration_number) {
      return NextResponse.json(
        {
          error: "Missing required field",
          details: 'Registration number is required. Please provide "registration_number" in your request.',
        },
        { status: 400 },
      )
    }

    if (!new_level) {
      return NextResponse.json(
        {
          error: "Missing required field",
          details: 'New level of study is required. Please provide "new_level" with the target level of study.',
        },
        { status: 400 },
      )
    }

    const { rows } = await pool.query(
      `UPDATE students SET level_of_study=$1 WHERE registration_number = $2 RETURNING *`,
      [new_level, registration_number],
    )

    if (rows.length === 0) {
      return NextResponse.json(
        {
          error: "Student not found",
          details: `No student found with registration number: ${registration_number}`,
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      message: "Student promoted successfully",
      student: rows[0],
    })
  } catch (error) {
    console.error("Error promoting students:", error)
    return NextResponse.json(
      {
        error: "Failed to promote students",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
