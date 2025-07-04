import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const studentId = params.id
    console.log("Deregistering student:", studentId)

    let reason = ""
    try {
      const body = await request.json()
      reason = body.reason || body.deregistration_reason || ""
    } catch (e) {
      // If no body or invalid JSON, use default empty reason
    }

    const today = new Date().toISOString().split("T")[0]

    const { rows } = await pool.query(
      `UPDATE students SET 
        deregistered=true, 
        deregistration_date=$1, 
        deregistration_reason=$2,
        status='deregistered' 
      WHERE id=$3 RETURNING *`,
      [today, reason, studentId],
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Student deregistered successfully",
      student: rows[0],
    })
  } catch (error) {
    console.error("Error deregistering student:", error)
    return NextResponse.json(
      {
        error: "Failed to deregister student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
