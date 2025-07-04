"use client"
import { LoginForm } from "@/components/LoginForm"
import { Dashboard } from "@/components/Dashboard"
import { ToastContainer } from "@/components/ToastContainer"
import { PasswordResetForm } from "@/components/PasswordResetForm"
import { useAuth } from "@/hooks/useAuth"
import Image from "next/image"
import ImprovedSpinner from "@/components/Spinner"

export default function AdminPortal() {
  const { isAuthenticated, isLoading, showPasswordReset, user, completePasswordReset } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
       <ImprovedSpinner />
      </div>
    )
  }

  return (
    <main className="bg-[url(/background.jpg)]">
      <ToastContainer />
      {showPasswordReset && user ? (
        <PasswordResetForm 
          userId={user.id} 
          userType="admin" 
          username={user.username} 
          onSuccess={completePasswordReset} 
        />
      ) : isAuthenticated ? (
        <Dashboard /> 
      ) : (
        <LoginForm />
      )}
    </main>
  )
}
