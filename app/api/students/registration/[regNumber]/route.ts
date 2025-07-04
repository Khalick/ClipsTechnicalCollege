import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { regNumber: string } }) {
  try {
    const registrationNumber = params.regNumber
    console.log("Fetching student with registration number:", registrationNumber)

    const { rows } = await pool.query("SELECT * FROM students WHERE registration_number = $1", [registrationNumber])

    if (rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error("Error fetching student by registration number:", error)
    return NextResponse.json(
      {
        error: "Failed to fetch student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
