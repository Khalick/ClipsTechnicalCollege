"use client"

import type React from "react"
import { useState } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"
import Image from "next/image"

export function StudentLoginForm() {
  const [credentials, setCredentials] = useState({ registrationNumber: "", password: "" })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useStudentAuth()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.registrationNumber || !credentials.password) {
      showToast("Please enter both registration number and password", "error")
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

  return (
    <div className="kyu-login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>STUDENT PORTAL</h1>
        </div>
        
        <div className="login-content">
          <div className="logo-section">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-PKLKzzAhhXiO6YgHjD6hzdOTjB8KBT.jpeg"
              alt="CLIPS TECHNICAL COLLEGE Logo"
              width={80}
              height={80}
              className="login-logo"
            />
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="registrationNumber">Username:</label>
              <input
                type="text"
                id="registrationNumber"
                placeholder="Username"
                value={credentials.registrationNumber}
                onChange={(e) => setCredentials((prev) => ({ ...prev, registrationNumber: e.target.value }))}
                required
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                required
                className="form-input"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="forgot-password-btn">
                Forgot Password
              </button>
              <button type="submit" className="sign-in-btn" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </button>
            </div>
          </form>

          <div className="form-hint">
            <small>First time? Use your National ID (18+) or Birth Certificate (under 18)</small>
          </div>
        </div>
      </div>
    </div>
  )
}
