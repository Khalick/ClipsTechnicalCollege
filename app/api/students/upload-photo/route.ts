import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('image') as File
    const registrationNumber = formData.get('registrationNumber') as string

    if (!file || !registrationNumber) {
      return NextResponse.json(
        { success: false, message: 'Image file and registration number are required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid file type. Please upload JPEG, PNG, or GIF' },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'student-photos')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileExtension = path.extname(file.name)
    const filename = `${registrationNumber}_${timestamp}${fileExtension}`
    const filepath = path.join(uploadDir, filename)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Update student record with photo URL
    const photoUrl = `/uploads/student-photos/${filename}`
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({
        photo_url: photoUrl,
        updated_at: new Date().toISOString()
      })
      .eq('registration_number', registrationNumber)

    if (updateError) {
      console.error('Database error:', updateError)
      // Clean up uploaded file
      try {
        fs.unlinkSync(filepath)
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError)
      }
      return NextResponse.json(
        { success: false, message: 'Failed to update student record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Photo uploaded successfully',
      photoUrl
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
