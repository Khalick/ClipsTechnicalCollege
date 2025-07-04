import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Add CORS headers
  const response = NextResponse.next()

  const origin = request.headers.get("origin")
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
    "https://studentportaladmin.netlify.app",
    "https://clipscollegestudentportal.netlify.app",
  ]

  if (origin && allowedOrigins.includes(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
  }

  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Accept, Origin, X-Requested-With, X-Registration-Number, X-Filename, X-Name, X-Course, X-Level-Of-Study, X-Email",
  )
  response.headers.set("Access-Control-Allow-Credentials", "true")
  response.headers.set("Access-Control-Expose-Headers", "Content-Length, X-Total-Count")
  response.headers.set("Access-Control-Max-Age", "86400")

  // Handle preflight requests
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: response.headers })
  }

  return response
}

export const config = {
  matcher: "/api/:path*",
}
