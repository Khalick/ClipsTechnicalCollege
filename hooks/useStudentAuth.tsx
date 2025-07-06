"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface StudentUser {
  id: string
  name: string
  registrationNumber: string
  course?: string
  level_of_study?: string
  registration_number?: string
}

interface StudentAuthContextType {
  user: StudentUser | null
  isAuthenticated: boolean
  isLoading: boolean
  showPasswordReset: boolean
  login: (registrationNumber: string, password: string) => Promise<void>
  logout: () => void
  completePasswordReset: () => void
}

const StudentAuthContext = createContext<StudentAuthContextType | undefined>(undefined)

export function StudentAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<StudentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPasswordReset, setShowPasswordReset] = useState(false)

  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem("studentToken")
      localStorage.removeItem("studentData")
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    setIsLoading(false)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const login = async (registrationNumber: string, password: string) => {
    try {
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_number: registrationNumber, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || data.error || "Login failed")
      }

      if (data.first_login || data.requires_password_reset) {
        // First login - show password reset form
        setUser({
          id: data.student.id,
          name: data.student.name,
          registrationNumber: data.student.registration_number,
          course: data.student.course,
          level_of_study: data.student.level_of_study,
          registration_number: data.student.registration_number,
        })
        setShowPasswordReset(true)
      } else {
        // Regular login - store token and proceed
        localStorage.setItem("studentToken", data.token)
        localStorage.setItem("studentData", JSON.stringify(data.student))

        setUser({
          id: data.student.id,
          name: data.student.name,
          registrationNumber: data.student.registration_number,
          course: data.student.course,
          level_of_study: data.student.level_of_study,
          registration_number: data.student.registration_number,
        })
      }
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("studentToken")
    localStorage.removeItem("studentData")
    setUser(null)
    setShowPasswordReset(false)
  }

  const completePasswordReset = () => {
    // After password reset, complete the login process
    if (user) {
      localStorage.setItem("studentToken", "temp-token") // Will be replaced on next login
      localStorage.setItem("studentData", JSON.stringify(user))
    }
    setShowPasswordReset(false)
  }

  return (
    <StudentAuthContext.Provider
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
    </StudentAuthContext.Provider>
  )
}

export function useStudentAuth() {
  const context = useContext(StudentAuthContext)
  if (context === undefined) {
    throw new Error("useStudentAuth must be used within a StudentAuthProvider")
  }
  return context
}
