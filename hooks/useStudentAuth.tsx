"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface StudentUser {
  id: string
  name: string
  registrationNumber: string
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
      // Implement actual login API call
      const response = await fetch("/api/auth/student-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registration_number: registrationNumber, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Use the specific error message from the server
        throw new Error(data.message || data.error || "Login failed")
      }

      if (data.first_login) {
        setUser({
          id: data.student.id,
          name: data.student.name,
          registrationNumber: data.student.registration_number,
        })
        setShowPasswordReset(true)
      } else {
        localStorage.setItem("studentToken", data.token)
        localStorage.setItem("studentData", JSON.stringify(data.student))

        setUser({
          id: data.student.id,
          name: data.student.name,
          registrationNumber: data.student.registration_number,
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
