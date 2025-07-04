"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"

interface DocumentUploadFormProps {
  onUploadSuccess?: () => void
}

export function DocumentUploadForm({ onUploadSuccess }: DocumentUploadFormProps) {
  const [formData, setFormData] = useState({
    registrationNumber: "",
    documentType: "fees-structure"
  })
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const { showToast } = useToast()

  const documentTypes = [
    { value: "fees-structure", label: "Fees Statement" },
    { value: "exam-card", label: "Exam Card" },
    { value: "timetable", label: "Timetable" },
    { value: "results", label: "Result Slip" }
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.registrationNumber || !file) {
      showToast("Please fill all required fields", "error")
      return
    }

    setIsUploading(true)

    try {
      const uploadFormData = new FormData()
      uploadFormData.append("registrationNumber", formData.registrationNumber)
      uploadFormData.append("file", file)

      const response = await fetch(`/api/upload/${formData.documentType}`, {
        method: "POST",
        body: uploadFormData
      })

      const result = await response.json()

      if (response.ok) {
        showToast(result.message || "Document uploaded successfully", "success")
        setFormData({ registrationNumber: "", documentType: "fees-structure" })
        setFile(null)
        onUploadSuccess?.()
      } else {
        showToast(result.error || "Upload failed", "error")
      }
    } catch (error) {
      showToast("Error uploading document", "error")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="admin-form-card">
      <div className="form-header">
        <h2><i className="fas fa-cloud-upload-alt"></i> Document Upload</h2>
        <p className="form-description">Upload student documents including fees statements, exam cards, timetables, and result slips</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="registrationNumber">Student Registration Number</label>
          <input
            type="text"
            id="registrationNumber"
            value={formData.registrationNumber}
            onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
            placeholder="e.g., CS/001/2024"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="documentType">Document Type</label>
          <select
            id="documentType"
            value={formData.documentType}
            onChange={(e) => setFormData(prev => ({ ...prev, documentType: e.target.value }))}
            required
          >
            {documentTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="file">Select File</label>
          <input
            type="file"
            id="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            required
          />
          {file && (
            <div className="file-info">
              Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <button type="submit" disabled={isUploading} className="submit-btn">
          {isUploading ? "Uploading..." : "Upload Document"}
        </button>
      </form>
    </div>
  )
}