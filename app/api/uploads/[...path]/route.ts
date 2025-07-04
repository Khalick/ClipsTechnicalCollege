import { type NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const filePath = params.path.join("/")
    const fullPath = path.join(UPLOAD_DIR, filePath)

    // Security check - ensure the path is within the upload directory
    const resolvedPath = path.resolve(fullPath)
    const resolvedUploadDir = path.resolve(UPLOAD_DIR)

    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return NextResponse.json({ error: "Invalid file path" }, { status: 400 })
    }

    try {
      const fileBuffer = await fs.readFile(fullPath)
      const stats = await fs.stat(fullPath)

      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase()
      const contentType = getContentType(ext)

      return new NextResponse(fileBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Length": stats.size.toString(),
          "Cache-Control": "public, max-age=31536000", // Cache for 1 year
        },
      })
    } catch (fileError) {
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Error serving file:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

function getContentType(extension: string): string {
  const contentTypes: Record<string, string> = {
    ".pdf": "application/pdf",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
  }

  return contentTypes[extension] || "application/octet-stream"
}
