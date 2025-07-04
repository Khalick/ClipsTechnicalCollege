import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { supabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  console.log("=== Admin Login Request Started ===")

  try {
    const body = await request.json()
    console.log("Request body parsed:", { username: body.username, hasPassword: !!body.password })

    const { username, password } = body

    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ error: "Username and password required" }, { status: 400 })
    }

    const secretKey = process.env.SECRET_KEY || "dev-secret-key-for-clips-college-2024"
    console.log("Using secret key:", secretKey ? "✓ Available" : "✗ Missing")

    if (!supabase) {
      return NextResponse.json(
        {
          error: "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 500 },
      )
    }

    try {
      // Find the admin user in Supabase
      const { data: admins, error } = await supabase
        .from("admins")
        .select("*")
        .eq("username", username)
        .eq("is_active", true)

      if (error) {
        console.error("Database query error:", error)
        return NextResponse.json(
          {
            error: "Database connection failed",
            details: error.message,
          },
          { status: 503 },
        )
      }

      if (!admins || admins.length === 0) {
        console.log("Admin user not found:", username)
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      const admin = admins[0]
      console.log("Admin user found:", { id: admin.id, username: admin.username })

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password_hash)
      console.log("Password verification result:", isValidPassword)

      if (!isValidPassword) {
        console.log("Invalid password for user:", username)
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          admin_id: admin.id,
          username: admin.username,
          type: "admin",
        },
        secretKey,
        { expiresIn: "8h" },
      )

      console.log("Login successful for admin:", username)

      return NextResponse.json({
        success: true,
        data: {
          token,
          adminId: admin.id,
          username: admin.username,
          first_login: admin.first_login || false,
        },
        message: "Login successful",
      })
    } catch (dbError) {
      console.error("Supabase error:", dbError)
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: "Please check your Supabase configuration",
          hint: "Verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables",
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Unexpected error in admin login:", error)
    return NextResponse.json(
      {
        error: "Unexpected error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
