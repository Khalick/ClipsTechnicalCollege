import { type NextRequest, NextResponse } from "next/server"
import { supabase, testConnection } from "@/lib/db"

export async function GET(request: NextRequest) {
  const healthCheck = {
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    database: "unknown",
    storage: "unknown",
    secretKey: "unknown",
    errors: [] as string[],
    warnings: [] as string[],
  }

  // Check secret key
  if (process.env.SECRET_KEY) {
    healthCheck.secretKey = "configured"
  } else {
    healthCheck.secretKey = "using fallback"
    healthCheck.warnings.push("Using fallback SECRET_KEY - set SECRET_KEY environment variable for production")
  }

  // Check Supabase environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    healthCheck.errors.push("NEXT_PUBLIC_SUPABASE_URL environment variable is missing")
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    healthCheck.errors.push("SUPABASE_SERVICE_ROLE_KEY environment variable is missing")
  }

  // Test database connection
  try {
    const isConnected = await testConnection()
    if (isConnected) {
      healthCheck.database = "connected"

      // Check if tables exist
      const { data: tables, error } = await supabase
        .from("information_schema.tables")
        .select("table_name")
        .eq("table_schema", "public")
        .in("table_name", ["admins", "students", "units", "student_documents"])

      if (error) {
        healthCheck.warnings.push("Could not verify table structure")
      } else if (!tables || tables.length < 4) {
        healthCheck.warnings.push("Some database tables may be missing - run schema setup")
      }
    } else {
      healthCheck.database = "disconnected"
      healthCheck.errors.push("Could not connect to Supabase database")
    }
  } catch (error) {
    healthCheck.database = "error"
    healthCheck.errors.push(`Database connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }

  // Test storage
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets()
    if (error) {
      healthCheck.storage = "error"
      healthCheck.errors.push(`Storage connection failed: ${error.message}`)
    } else {
      healthCheck.storage = "connected"
      const hasStudentDocuments = buckets?.some((bucket) => bucket.name === "student-documents")
      if (!hasStudentDocuments) {
        healthCheck.warnings.push("student-documents storage bucket not found - will be created automatically")
      }
    }
  } catch (error) {
    healthCheck.storage = "error"
    healthCheck.errors.push(`Storage test failed: ${error instanceof Error ? error.message : "Unknown error"}`)
  }

  // Determine overall status
  if (healthCheck.errors.length > 0) {
    healthCheck.status = "error"
  } else if (healthCheck.warnings.length > 0) {
    healthCheck.status = "warning"
  }

  const status = healthCheck.errors.length > 0 ? 503 : 200

  return NextResponse.json(healthCheck, { status })
}
