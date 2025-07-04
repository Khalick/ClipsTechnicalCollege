"use client"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"

interface PasswordResetFormProps {
  userId: string
  userType: "admin" | "student"
  username: string
  onSuccess: () => void
}

export function PasswordResetForm({ userId, userType, username, onSuccess }: PasswordResetFormProps) {
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
      showToast("Password must be at least 6 characters", "error")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          user_type: userType,
          new_password: passwords.newPassword
        })
      })

      const result = await response.json()

      if (response.ok) {
        showToast("Password updated successfully", "success")
        onSuccess()
      } else {
        showToast(result.error || "Failed to update password", "error")
      }
    } catch (error) {
      showToast("Error updating password", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="password-reset-overlay">
      <div className="password-reset-modal">
        <h2>First Time Login - Set New Password</h2>
        <p>Welcome {username}! Please set a new password to continue.</p>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={passwords.newPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, confirmPassword: e.target.value }))}
              placeholder="Confirm new password"
              required
            />
          </div>

          <button type="submit" disabled={isLoading} className="submit-btn">
            {isLoading ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  )
}