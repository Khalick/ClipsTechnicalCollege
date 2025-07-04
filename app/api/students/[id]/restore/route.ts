import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const studentId = params.id
    console.log("Restoring deregistered student:", studentId)

    const { rows } = await pool.query(
      `UPDATE students SET 
        deregistered=false, 
        deregistration_date=NULL, 
        deregistration_reason=NULL,
        status='active' 
      WHERE id=$1 RETURNING *`,
      [studentId],
    )

    if (rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({
      message: "Student restored successfully",
      student: rows[0],
    })
  } catch (error) {
    console.error("Error restoring student:", error)
    return NextResponse.json(
      {
        error: "Failed to restore student",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
