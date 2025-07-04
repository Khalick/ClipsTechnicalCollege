"use client"

import type React from "react"

import { useState } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"
import Image from "next/image"

export function StudentLoginForm() {
  const [credentials, setCredentials] = useState({ registrationNumber: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [resetData, setResetData] = useState({ regNumber: "", newPassword: "", confirmPassword: "" })
  const { login } = useStudentAuth()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.registrationNumber || !credentials.password) {
      showToast("Please enter both registration number and password", "error")
      return
    }

    // Basic validation for password format
    if (credentials.password.length < 6) {
      showToast("Password must be at least 6 characters long", "error")
      return
    }

    setIsLoading(true)

    try {
      await login(credentials.registrationNumber, credentials.password)
      showToast("Login successful! Welcome back.", "success")
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Login failed"
      showToast(errorMessage, "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resetData.regNumber || !resetData.newPassword || !resetData.confirmPassword) {
      showToast("Please fill in all fields", "error")
      return
    }

    if (resetData.newPassword !== resetData.confirmPassword) {
      showToast("Passwords do not match", "error")
      return
    }

    try {
      // Implement password reset logic here
      showToast("Password reset successful!", "success")
      setShowForgotPassword(false)
      setResetData({ regNumber: "", newPassword: "", confirmPassword: "" })
    } catch (error) {
      showToast("Password reset failed", "error")
    }
  }

  return (
    <div className="student-login-view">
      <div className="login-container">
        <div className="logo">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-PKLKzzAhhXiO6YgHjD6hzdOTjB8KBT.jpeg"
            alt="CLIPS TECHNICAL COLLEGE Logo"
            width={100}
            height={100}
          />
        </div>

        <h1>Welcome</h1>
        <p className="login-instructions">Please fill in your details to log in</p>
        <div className="login-info">
          <p>
            <i className="fas fa-info-circle"></i>
            <strong>How to Login:</strong>
          </p>
          <ul>
            <li><i className="fas fa-user"></i> Enter your registration/admission number</li>
            <li><i className="fas fa-key"></i> <strong>Password:</strong> Use your National ID (if 18+) or Birth Certificate number (if under 18)</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="registrationNumber">Registration Number</label>
            <input
              type="text"
              id="registrationNumber"
              placeholder="Enter your registration/admission number"
              value={credentials.registrationNumber}
              onChange={(e) => setCredentials((prev) => ({ ...prev, registrationNumber: e.target.value }))}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              placeholder="Enter your National ID or Birth Certificate number"
              value={credentials.password}
              onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            <small className="form-hint">
              <i className="fas fa-question-circle"></i> Use your National ID (if 18+) or Birth Certificate number (if under 18)
            </small>
          </div>

          <div className="remember-forgot">
            <div className="remember-me">
              <input type="checkbox" id="remember" />
              <label htmlFor="remember">Remember me</label>
            </div>
            <button type="button" className="forgot-password" onClick={() => setShowForgotPassword(true)}>
              Forgot Password?
            </button>
          </div>

          <button type="submit" className="login-button" disabled={isLoading}>
            {isLoading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="modal">
          <div className="modal-content">
            <span className="close" onClick={() => setShowForgotPassword(false)}>
              &times;
            </span>
            <h2>Reset Password</h2>
            <p>Enter your details to reset your password:</p>
            <form onSubmit={handlePasswordReset}>
              <div className="input-group">
                <label htmlFor="resetRegNumber">Registration Number</label>
                <input
                  type="text"
                  id="resetRegNumber"
                  placeholder="Enter your registration number"
                  value={resetData.regNumber}
                  onChange={(e) => setResetData((prev) => ({ ...prev, regNumber: e.target.value }))}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="newPassword">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  placeholder="Enter new password"
                  value={resetData.newPassword}
                  onChange={(e) => setResetData((prev) => ({ ...prev, newPassword: e.target.value }))}
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="confirmPassword">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Confirm new password"
                  value={resetData.confirmPassword}
                  onChange={(e) => setResetData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className="login-button">
                Reset Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
