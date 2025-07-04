"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"
import { Card } from "@/components/ui/card"
import { FilePreview } from "@/components/FilePreview"

export function ExamCardUploadForm() {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registrationNumber.trim()) {
      showToast("Please enter a registration number", "error")
      return
    }

    if (!file) {
      showToast("Please select a file to upload", "error")
      return
    }

    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please upload a PDF file only", "error")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast("File size should be less than 5MB", "error")
      return
    }

    setIsLoading(true)

    try {
      const formData = new FormData()
      formData.append("registrationNumber", registrationNumber.trim())
      formData.append("file", file)

      const result = await apiRequest("/api/upload/exam-card", {
        method: "POST",
        body: formData,
      })

      if (result.success) {
        showToast("Exam card uploaded successfully!", "success")
        setRegistrationNumber("")
        setFile(null)
      } else {
        showToast(result.error || "Failed to upload exam card", "error")
      }
    } catch (error) {
      showToast("An error occurred while uploading exam card", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card title="Upload Exam Card" description="Upload exam card for a student" icon="fas fa-id-card">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="examCardStudentReg">
            <i className="fas fa-id-card"></i>Registration Number
          </label>
          <input
            type="text"
            id="examCardStudentReg"
            className="input-field"
            placeholder="Enter registration number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="examCardFile">
            <i className="fas fa-file-pdf"></i>Exam Card File (PDF only)
          </label>
          <input
            type="file"
            id="examCardFile"
            className="input-field"
            accept=".pdf,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            required
          />
          <p className="form-help-text">Only PDF files are accepted</p>

          {file && <FilePreview file={file} />}
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
          <i className="fas fa-upload"></i>
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <span>Uploading...</span>
            </>
          ) : (
            <span>Upload Exam Card</span>
          )}
        </button>
      </form>
    </Card>
  )
}
