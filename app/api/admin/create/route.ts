import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("Creating admin user:", { username: body.username })

    const { username, password, email, full_name } = body

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    // Check if admin already exists
    const { rows: existingAdmins } = await pool.query("SELECT id FROM admins WHERE username = $1", [username])

    if (existingAdmins.length > 0) {
      return NextResponse.json({ error: "Admin user already exists" }, { status: 409 })
    }

    // Hash the password
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Insert new admin
    const { rows } = await pool.query(
      `INSERT INTO admins (username, password_hash, email, full_name, role, is_active) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, username, email, full_name, role, is_active, created_at`,
      [username, passwordHash, email || null, full_name || null, "admin", true],
    )

    console.log("Admin user created successfully:", rows[0].id)

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        admin: {
          id: rows[0].id,
          username: rows[0].username,
          email: rows[0].email,
          full_name: rows[0].full_name,
          role: rows[0].role,
          is_active: rows[0].is_active,
          created_at: rows[0].created_at,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating admin user:", error)
    return NextResponse.json(
      {
        error: "Failed to create admin user",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
