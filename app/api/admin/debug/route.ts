import { type NextRequest, NextResponse } from "next/server"
import { pool } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(request: NextRequest) {
  try {
    // Check if admins table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admins'
      );
    `)

    if (!tableCheck.rows[0].exists) {
      return NextResponse.json({
        error: "Admins table does not exist",
        suggestion: "Run the database setup scripts first",
      })
    }

    // Get all admin users (without passwords)
    const { rows: admins } = await pool.query(`
      SELECT id, username, email, full_name, is_active, created_at 
      FROM admins 
      ORDER BY created_at DESC
    `)

    // Check environment variables
    const envCheck = {
      SECRET_KEY: !!process.env.SECRET_KEY,
      NEON_DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
    }

    return NextResponse.json({
      tableExists: true,
      adminCount: admins.length,
      admins: admins,
      environment: envCheck,
      message: admins.length === 0 ? "No admin users found. Creating default admin..." : "Admin users found",
    })
  } catch (error) {
    console.error("Debug error:", error)
    return NextResponse.json(
      {
        error: "Database connection failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Force create default admin user
    const defaultPasswordHash = await bcrypt.hash("admin123", 10)

    const { rows } = await pool.query(
      `
      INSERT INTO admins (username, password_hash, email, full_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6) 
      ON CONFLICT (username) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, username, email, full_name, created_at
    `,
      ["admin", defaultPasswordHash, "admin@clipstech.edu", "System Administrator", "admin", true],
    )

    return NextResponse.json({
      message: "Default admin user created/updated",
      admin: rows[0],
      credentials: {
        username: "admin",
        password: "admin123",
      },
    })
  } catch (error) {
    console.error("Error creating default admin:", error)
    return NextResponse.json(
      {
        error: "Failed to create default admin",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
