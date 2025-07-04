import { type NextRequest, NextResponse } from "next/server"
import jwt from "jsonwebtoken"
import { supabase } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const secretKey = process.env.SECRET_KEY || "dev-secret-key-for-clips-college-2024"

    const decoded = jwt.verify(token, secretKey) as any

    if (decoded.type !== "admin") {
      return NextResponse.json({ error: "Invalid token type" }, { status: 401 })
    }

    // Verify admin exists in Supabase
    const { data: admins, error } = await supabase
      .from("admins")
      .select("id, username, email, full_name")
      .eq("id", decoded.admin_id)
      .eq("is_active", true)

    if (error) {
      console.error("Database error during token verification:", error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    if (!admins || admins.length === 0) {
      return NextResponse.json({ error: "Admin not found" }, { status: 401 })
    }

    return NextResponse.json({
      valid: true,
      success: true,
      data: { admin: admins[0] },
    })
  } catch (error) {
    console.error("Token verification error:", error)

    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    } else if (error instanceof jwt.TokenExpiredError) {
      return NextResponse.json({ error: "Token expired" }, { status: 401 })
    }

    return NextResponse.json(
      {
        error: "Token verification failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
