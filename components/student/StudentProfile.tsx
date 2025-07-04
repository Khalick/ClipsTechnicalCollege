"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import Image from "next/image"

interface StudentData {
  id: string
  name: string
  registration_number: string
  course: string
  level_of_study: string
  status: string
  national_id?: string
  date_of_birth?: string
  email?: string
  photo_url?: string
}

interface StudentProfileProps {
  studentData: StudentData | null
  onDataChange: (data: StudentData) => void
}

export function StudentProfile({ studentData, onDataChange }: StudentProfileProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<Partial<StudentData>>({})
  const { showToast } = useToast()

  if (!studentData) return null

  const handleEdit = () => {
    setIsEditing(true)
    setEditData({ email: studentData.email })
  }

  const handleSave = async () => {
    try {
      // Implement save logic here
      const updatedData = { ...studentData, ...editData }
      onDataChange(updatedData)
      setIsEditing(false)
      showToast("Profile updated successfully", "success")
    } catch (error) {
      showToast("Error updating profile", "error")
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData({})
  }

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Implement photo upload logic
      showToast("Photo upload functionality coming soon", "info")
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="student-profile">
      <div className="student-photo-container">
        <div className="student-image-wrapper">
          {studentData.photo_url ? (
            <Image
              src={studentData.photo_url || "/placeholder.svg"}
              alt="Student Photo"
              width={150}
              height={150}
              className="student-image"
            />
          ) : (
            <div className="student-avatar">
              <div className="avatar-initials">{getInitials(studentData.name)}</div>
            </div>
          )}
        </div>

        <div className="photo-upload-section">
          <input
            type="file"
            id="photoInput"
            accept="image/*"
            className="hidden-file-input"
            onChange={handlePhotoUpload}
            aria-label="Upload student photo"
          />
          <button className="upload-photo-btn" onClick={() => document.getElementById("photoInput")?.click()}>
            Update Photo
          </button>
        </div>
      </div>

      <div className="student-details">
        <h2>{studentData.name}</h2>
        <p>
          <strong>Registration Number:</strong> {studentData.registration_number}
        </p>
        <p>
          <strong>Course:</strong> {studentData.course}
        </p>
        <p>
          <strong>Level of Study:</strong> {studentData.level_of_study}
        </p>
        <p>
          <strong>Status:</strong> {studentData.status}
        </p>
        <p>
          <strong>National ID:</strong> {studentData.national_id || "Not provided"}
        </p>
        <p>
          <strong>Date of Birth:</strong>{" "}
          {studentData.date_of_birth ? new Date(studentData.date_of_birth).toLocaleDateString() : "Not provided"}
        </p>
        <p>
          <strong>Email:</strong>{" "}
          {isEditing ? (
            <input
              type="email"
              value={editData.email || ""}
              onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
              className="edit-input"
              placeholder="Enter email address"
              aria-label="Email address"
            />
          ) : (
            studentData.email || "Not provided"
          )}
        </p>

        {isEditing ? (
          <div className="edit-actions">
            <button onClick={handleSave} className="save-btn">
              Save Changes
            </button>
            <button onClick={handleCancel} className="cancel-btn">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={handleEdit} className="edit-btn">
            Edit Info
          </button>
        )}
      </div>
    </div>
  )
}
