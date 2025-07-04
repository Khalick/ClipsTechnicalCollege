"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import { apiRequest } from "@/lib/api"

interface User {
  username: string
  id: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  showPasswordReset: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  completePasswordReset: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminData")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    setIsLoading(false)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      if (!token) {
        setIsLoading(false)
        return
      }

      const result = await apiRequest("/api/admin/verify-token")
      if (result.success && result.data?.admin) {
        setUser({
          username: result.data.admin.username,
          id: result.data.admin.id,
        })
      } else {
        localStorage.removeItem("adminToken")
        localStorage.removeItem("adminData")
      }
    } catch (error) {
      console.error("Auth check error:", error)
      localStorage.removeItem("adminToken")
      localStorage.removeItem("adminData")
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (username: string, password: string) => {
    try {
      console.log("Attempting login for:", username)

      const result = await apiRequest("/api/auth/admin-login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      })

      console.log("Login result:", result)

      if (result.success && result.data?.token) {
        if (result.data.first_login) {
          setUser({ username: result.data.username, id: result.data.adminId })
          setShowPasswordReset(true)
        } else {
          localStorage.setItem("adminToken", result.data.token)
          localStorage.setItem(
            "adminData",
            JSON.stringify({
              username: result.data.username,
              id: result.data.adminId,
            }),
          )
          setUser({
            username: result.data.username,
            id: result.data.adminId,
          })
        }
      } else {
        throw new Error(result.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("adminToken")
    localStorage.removeItem("adminData")
    setUser(null)
    setShowPasswordReset(false)
  }

  const completePasswordReset = () => {
    setShowPasswordReset(false)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !showPasswordReset,
        isLoading,
        showPasswordReset,
        login,
        logout,
        completePasswordReset,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
