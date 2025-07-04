"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface StudentFormData {
  name: string
  registration_number: string
  course: string
  level_of_study: string
  national_id: string
  birth_certificate: string
  date_of_birth: string
  email: string
}

export function StudentRegistrationForm() {
  const [formData, setFormData] = useState<StudentFormData>({
    name: "",
    registration_number: "",
    course: "",
    level_of_study: "",
    national_id: "",
    birth_certificate: "",
    date_of_birth: "",
    email: "",
  })
  const [photo, setPhoto] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getAge = () => calculateAge(formData.date_of_birth)
  const isAdult = getAge() >= 18

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate required fields
    if (!formData.name || !formData.registration_number || !formData.course || !formData.level_of_study || !formData.date_of_birth) {
      showToast("Please fill in all required fields", "error")
      setIsLoading(false)
      return
    }

    // Validate based on age
    const age = getAge()
    if (age >= 18 && !formData.national_id) {
      showToast("National ID is required for students 18 years and older. This will be used as your login password.", "error")
      setIsLoading(false)
      return
    }
    
    if (age < 18 && !formData.birth_certificate) {
      showToast("Birth certificate number is required for students under 18 years. This will be used as your login password.", "error")
      setIsLoading(false)
      return
    }

    // Additional validation for document format (optional)
    if (formData.national_id && formData.national_id.length < 6) {
      showToast("Please enter a valid National ID number", "error")
      setIsLoading(false)
      return
    }
    
    if (formData.birth_certificate && formData.birth_certificate.length < 6) {
      showToast("Please enter a valid Birth Certificate number", "error")
      setIsLoading(false)
      return
    }

    try {
      const submitData = new FormData()

      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value) submitData.append(key, value)
      })

      // Add photo if selected
      if (photo) {
        submitData.append("photo", photo)
      }

      const result = await apiRequest("/api/students", {
        method: "POST",
        body: submitData,
      })

      if (result.success) {
        showToast("Student registered successfully!", "success")
        // Reset form
        setFormData({
          name: "",
          registration_number: "",
          course: "",
          level_of_study: "",
          national_id: "",
          birth_certificate: "",
          date_of_birth: "",
          email: "",
        })
        setPhoto(null)
      } else {
        showToast(result.error || "Failed to register student", "error")
      }
    } catch (error) {
      showToast("An error occurred while registering student", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: keyof StudentFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <i className="fas fa-user-plus"></i> Student Registration
        </CardTitle>
        <CardDescription>Register new students into the system with their personal and academic information. Age-based authentication will be automatically configured.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="studentName">
            <i className="fas fa-user"></i>Full Name
          </label>
          <input
            type="text"
            id="studentName"
            className="input-field"
            placeholder="Enter student's full name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentReg">
            <i className="fas fa-id-card"></i>Registration Number
          </label>
          <input
            type="text"
            id="studentReg"
            className="input-field"
            placeholder="Enter registration number"
            value={formData.registration_number}
            onChange={(e) => handleInputChange("registration_number", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentCourse">
            <i className="fas fa-book"></i>Course
          </label>
          <input
            type="text"
            id="studentCourse"
            className="input-field"
            placeholder="Enter course name"
            value={formData.course}
            onChange={(e) => handleInputChange("course", e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="studentLevel">
            <i className="fas fa-calendar-alt"></i>Level of Study
          </label>
          <input
            type="text"
            id="studentLevel"
            className="input-field"
            placeholder="e.g., Year 2 Semester 1"
            value={formData.level_of_study}
            onChange={(e) => handleInputChange("level_of_study", e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="studentDob">
              <i className="fas fa-birthday-cake"></i>Date of Birth *
            </label>
            <input
              type="date"
              id="studentDob"
              className="input-field"
              value={formData.date_of_birth}
              onChange={(e) => handleInputChange("date_of_birth", e.target.value)}
              required
            />
            {formData.date_of_birth && (
              <small className="form-hint">
                Age: {getAge()} years {isAdult ? "(Adult)" : "(Minor)"}
              </small>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="studentEmail">
              <i className="fas fa-envelope"></i>Email
            </label>
            <input
              type="email"
              id="studentEmail"
              className="input-field"
              placeholder="Enter email address"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            />
          </div>
        </div>

        {/* Age-based authentication fields */}
        <div className="form-section">
          <h4 className="form-section-title">
            <i className="fas fa-key"></i>Authentication Information
          </h4>
          <div className="form-info">
            <p>
              <i className="fas fa-info-circle"></i>
              {isAdult 
                ? "Students 18 years and older must provide their National ID, which will be used for login authentication."
                : "Students under 18 years must provide their Birth Certificate number, which will be used for login authentication."
              }
            </p>
            <p>
              <i className="fas fa-exclamation-triangle"></i>
              <strong>Important:</strong> Your {isAdult ? "National ID" : "Birth Certificate"} number will be your password for logging into the student portal.
            </p>
          </div>
          
          {isAdult ? (
            <div className="form-group">
              <label htmlFor="studentNationalId">
                <i className="fas fa-id-card"></i>National ID * (This will be your login password)
              </label>
              <input
                type="text"
                id="studentNationalId"
                className="input-field"
                placeholder="Enter your national ID number"
                value={formData.national_id}
                onChange={(e) => handleInputChange("national_id", e.target.value)}
                required
              />
              <small className="form-hint">
                <i className="fas fa-lock"></i> This number will be used as your password to access the student portal
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="studentBirthCert">
                <i className="fas fa-certificate"></i>Birth Certificate Number * (This will be your login password)
              </label>
              <input
                type="text"
                id="studentBirthCert"
                className="input-field"
                placeholder="Enter your birth certificate number"
                value={formData.birth_certificate}
                onChange={(e) => handleInputChange("birth_certificate", e.target.value)}
                required
              />
              <small className="form-hint">
                <i className="fas fa-lock"></i> This number will be used as your password to access the student portal
              </small>
            </div>
          )}
          
          {/* Optional field for the other document */}
          {isAdult ? (
            <div className="form-group">
              <label htmlFor="studentBirthCertOpt">
                <i className="fas fa-certificate"></i>Birth Certificate Number (Optional)
              </label>
              <input
                type="text"
                id="studentBirthCertOpt"
                className="input-field"
                placeholder="Enter birth certificate number (optional)"
                value={formData.birth_certificate}
                onChange={(e) => handleInputChange("birth_certificate", e.target.value)}
              />
              <small className="form-hint">
                Optional: For record keeping purposes
              </small>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="studentNationalIdOpt">
                <i className="fas fa-id-card"></i>National ID (Optional)
              </label>
              <input
                type="text"
                id="studentNationalIdOpt"
                className="input-field"
                placeholder="Enter national ID number (optional)"
                value={formData.national_id}
                onChange={(e) => handleInputChange("national_id", e.target.value)}
              />
              <small className="form-hint">
                Optional: For record keeping purposes
              </small>
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="studentPhoto">
            <i className="fas fa-camera"></i>Student Photo
          </label>
          <input
            type="file"
            id="studentPhoto"
            className="input-field"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files?.[0] || null)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
          <i className="fas fa-user-check"></i>
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <span>Registering...</span>
            </>
          ) : (
            <span>Register Student</span>
          )}
        </button>
        </form>
      </CardContent>
    </Card>
  )
}
