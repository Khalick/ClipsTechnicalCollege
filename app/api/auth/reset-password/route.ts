import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import bcrypt from "bcrypt"

export async function POST(request: NextRequest) {
  try {
    const { user_id, user_type, new_password } = await request.json()

    if (!user_id || !user_type || !new_password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(new_password, 10)
    const table = user_type === "admin" ? "admins" : "students"
    const passwordField = user_type === "admin" ? "password_hash" : "password"

    const { error } = await supabase
      .from(table)
      .update({ 
        [passwordField]: password_hash,
        first_login: false 
      })
      .eq("id", user_id)

    if (error) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}