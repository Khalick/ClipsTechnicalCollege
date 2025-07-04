import { supabase } from "./db"

const BUCKET_NAME = "student-documents"

// Ensure bucket exists
async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets()
  const bucketExists = buckets?.some((bucket) => bucket.name === BUCKET_NAME)

  if (!bucketExists) {
    const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      allowedMimeTypes: [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      fileSizeLimit: 10485760, // 10MB
    })

    if (error) {
      console.error("Error creating bucket:", error)
    } else {
      console.log("Created storage bucket:", BUCKET_NAME)
    }
  }
}

export async function uploadFileToSupabase(
  file: File,
  folder: string,
  prefix = "",
): Promise<{ filePath: string; publicUrl: string }> {
  if (!file) {
    throw new Error("No file provided")
  }

  // Ensure bucket exists
  await ensureBucket()

  const fileExtension = file.name.split(".").pop()
  const timestamp = Date.now()
  const fileName = `${prefix}_${timestamp}.${fileExtension}`
  const filePath = `${folder}/${fileName}`

  console.log(`Uploading ${file.name} to Supabase storage...`)

  const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    console.error(`Error uploading to ${folder}:`, error)
    throw error
  }

  // Get the public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath)

  console.log(`File uploaded successfully to ${folder}`)
  return {
    filePath: data.path,
    publicUrl: urlData.publicUrl,
  }
}

export async function deleteFileFromSupabase(filePath: string): Promise<void> {
  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath])

  if (error) {
    console.error("Error deleting file:", error)
    throw error
  }

  console.log("File deleted successfully:", filePath)
}

export async function getFileInfo(filePath: string) {
  const { data, error } = await supabase.storage.from(BUCKET_NAME).list(filePath.split("/").slice(0, -1).join("/"), {
    search: filePath.split("/").pop(),
  })

  if (error) {
    return { exists: false }
  }

  const file = data?.find((f) => f.name === filePath.split("/").pop())

  return {
    exists: !!file,
    size: file?.metadata?.size,
    modified: file?.updated_at ? new Date(file.updated_at) : undefined,
  }
}

export { supabase }
