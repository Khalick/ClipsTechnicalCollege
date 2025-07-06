"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { useStudentAuth } from "@/hooks/useStudentAuth"

interface StudentPasswordResetFormProps {
  userId: string
  username: string
  onSuccess: () => void
}

export function StudentPasswordResetForm({ userId, username, onSuccess }: StudentPasswordResetFormProps) {
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  })
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwords.newPassword !== passwords.confirmPassword) {
      showToast("Passwords do not match", "error")
      return
    }

    if (passwords.newPassword.length < 6) {
      showToast("Password must be at least 6 characters long", "error")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/student-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: userId,
          new_password: passwords.newPassword
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Store the new token and student data
        localStorage.setItem("studentToken", result.token)
        localStorage.setItem("studentData", JSON.stringify(result.student))
        
        showToast("Password updated successfully! Welcome to your dashboard.", "success")
        onSuccess()
      } else {
        showToast(result.error || "Failed to update password", "error")
      }
    } catch (error) {
      console.error("Password update error:", error)
      showToast("Error updating password. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="kyu-login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Set New Password</h1>
        </div>
        
        <div className="login-content">
          <div className="logo-section">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-PKLKzzAhhXiO6YgHjD6hzdOTjB8KBT.jpeg"
              alt="CLIPS TECHNICAL COLLEGE Logo"
              width={80}
              height={80}
              className="login-logo"
            />
          </div>
          
          <div className="welcome-message">
            <p><strong>Welcome {username}!</strong></p>
            <p>This is your first time logging in. Please create a secure password to protect your account.</p>
          </div>
        
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                placeholder="Enter your new password"
                value={passwords.newPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
                required
                minLength={6}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password:</label>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Confirm your new password"
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
                required
                minLength={6}
                className="form-input"
              />
            </div>

            <button type="submit" className="sign-in-btn" disabled={isLoading} style={{width: '100%'}}>
              {isLoading ? "Updating Password..." : "Set Password & Continue"}
            </button>
          </form>

          <div className="form-hint">
            <small>
              Password must be at least 6 characters long. Your new password will replace your National ID/Birth Certificate for future logins.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}
