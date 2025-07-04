import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const debug = {
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV || "development",
      hasSecretKey: !!process.env.SECRET_KEY,
      secretKeySource: process.env.SECRET_KEY ? "environment" : "fallback",
    },
    database: {
      status: "not configured",
      note: "Using in-memory authentication - no database required",
    },
    authentication: {
      mode: "fallback only",
      availableAdmins: [
        {
          username: "admin",
          password: "admin123",
          note: "Primary administrator account",
        },
        {
          username: "clips_admin",
          password: "clips2024",
          note: "Secondary administrator account",
        },
      ],
    },
    system: {
      runtime: "v0 Next.js",
      note: "Optimized for v0 environment without external dependencies",
    },
  }

  return NextResponse.json(debug)
}
