"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/hooks/useToast"
import Image from "next/image"
export function LoginForm() {
  const [credentials, setCredentials] = useState({ username: "admin", password: "admin123" })
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!credentials.username || !credentials.password) {
      showToast("Please enter both username and password", "error")
      return
    }

    setIsLoading(true)

    try {
      await login(credentials.username, credentials.password)
      showToast("Login successful! Welcome back.", "success")
    } catch (error) {
      console.error("Login error:", error)
      showToast(error instanceof Error ? error.message : "Login failed", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-view">
      <div className="login-container">
        <div className="login-header">
          <div style={{ marginBottom: "20px", display: "inline-block" }}>
            <div className="admin-icon">
              <Image className="justify-center items-center" src={"/logo.jpg"}  width={100} height={100} alt="Clips Logo" />
            </div>
          </div>
          
          <h2 className="uppercase text-red-400">Admin Login</h2>
          <p>Please sign in to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">
              <i className="fas fa-user-circle"></i>Username
            </label>
            <div className="input-wrapper">
              <i className="fas fa-user input-icon"></i>
              <input
                type="text"
                id="username"
                className="input-field"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">
              <i className="fas fa-lock"></i>Password
            </label>
            <div className="input-wrapper">
              <i className="fas fa-key input-icon"></i>
              <input
                type="password"
                id="password"
                className="input-field"
                placeholder="Enter your password"
                value={credentials.password}
                onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            <i className="fas fa-sign-in-alt"></i>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
