import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import jwt from "jsonwebtoken"

export async function GET(request: NextRequest) {
  try {
    // Verify admin token
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, process.env.SECRET_KEY!) as any

    if (decoded.type !== "admin") {
      return NextResponse.json({ error: "Invalid token type" }, { status: 401 })
    }

    // Fetch all admin users (excluding password hashes)
    const { rows } = await pool.query(`
      SELECT 
        id,
        username,
        email,
        full_name,
        role,
        is_active,
        created_at,
        updated_at
      FROM admins 
      ORDER BY created_at DESC
    `)

    return NextResponse.json({
      admins: rows,
      total: rows.length,
    })
  } catch (error) {
    console.error("Error fetching admin users:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    } else if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: "Failed to fetch admin users",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
