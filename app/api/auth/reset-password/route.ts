import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase-client"
import bcrypt from "bcryptjs"

export async function POST(request: NextRequest) {
  try {
    const { user_id, user_type, new_password } = await request.json()

    if (!user_id || !user_type || !new_password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (new_password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(new_password, 10)
    const table = user_type === "admin" ? "admins" : "students"
    const passwordField = user_type === "admin" ? "password_hash" : "password"

    // Prepare update data - only include first_login for admins
    const updateData: any = { [passwordField]: password_hash }
    if (user_type === "admin") {
      updateData.first_login = false
    }

    const { error } = await supabaseAdmin
      .from(table)
      .update(updateData)
      .eq("id", user_id)

    if (error) {
      console.error("Password update error:", error)
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: "Password updated successfully" 
    })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}