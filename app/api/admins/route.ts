import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/db"
import bcrypt from "bcrypt"

export async function GET() {
  try {
    const { data: admins, error } = await supabase
      .from("admins")
      .select("id, username, email, full_name, role, is_active, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 })
    }

    return NextResponse.json({ success: true, admins })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { username, email, full_name, national_id } = await request.json()

    if (!username || !national_id) {
      return NextResponse.json({ error: "Username and national ID are required" }, { status: 400 })
    }

    const password_hash = await bcrypt.hash(national_id, 10)

    const { data: admin, error } = await supabase
      .from("admins")
      .insert({
        username,
        email,
        full_name,
        password_hash,
        role: "admin",
        is_active: true
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create admin" }, { status: 500 })
    }

    return NextResponse.json({ success: true, admin })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}