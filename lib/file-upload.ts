import { supabase } from "./db"
import { uploadFileToSupabase } from "./storage"

export async function handleFileUpload(registrationNumber: string, file: File, documentType: string) {
  try {
    console.log(`Handling file upload for ${registrationNumber}, document type: ${documentType}`)

    // Upload file to Supabase storage
    const uploadResult = await uploadFileToSupabase(file, documentType, registrationNumber)

    console.log("File uploaded successfully to Supabase storage")

    // Insert record into database
    const { data, error } = await supabase
      .from("student_documents")
      .insert({
        registration_number: registrationNumber,
        document_type: documentType,
        file_url: uploadResult.publicUrl,
        file_name: file.name,
        file_size: file.size,
        uploaded_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Database insertion error:", error)
      throw new Error("Database insertion failed")
    }

    console.log("File upload record saved to database")

    return {
      success: true,
      data: {
        id: data.id,
        registrationNumber,
        documentType,
        fileUrl: uploadResult.publicUrl,
        fileName: file.name,
        fileSize: file.size,
        uploadedAt: data.uploaded_at,
        storageMethod: "supabase",
      },
    }
  } catch (error) {
    console.error("File upload error:", error)
    throw error
  }
}
