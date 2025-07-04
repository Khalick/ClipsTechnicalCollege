import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "Supabase environment variables are missing. Define NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
  )
}

// Create Supabase client for server-side operations
export const supabase =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null

// Test the connection
export async function testConnection() {
  try {
    const { data, error } = await supabase.from("admins").select("count").limit(1)

    if (error && error.code !== "PGRST116") {
      // PGRST116 = table doesn't exist
      throw error
    }

    console.log("✅ Connected to Supabase database")
    return true
  } catch (error) {
    console.error("❌ Supabase connection failed:", error)
    return false
  }
}
