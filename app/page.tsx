"use client"
import { StudentLoginForm } from "@/components/student/StudentLoginForm"
import { StudentDashboard } from "@/components/student/StudentDashboard"
import { ToastContainer } from "@/components/ToastContainer"
import { PasswordResetForm } from "@/components/PasswordResetForm"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import ImprovedSpinner from "@/components/Spinner"

export default function StudentPortal() {
  const { isAuthenticated, isLoading, showPasswordReset, user, completePasswordReset } = useStudentAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <ImprovedSpinner />
      </div>
    )
  }

  return (
    <main>
      <ToastContainer />
      {showPasswordReset && user ? (
        <PasswordResetForm 
          userId={user.id} 
          userType="student" 
          username={user.name} 
          onSuccess={completePasswordReset} 
        />
      ) : isAuthenticated ? (
        <StudentDashboard /> 
      ) : (
        <StudentLoginForm />
      )}
    </main>
  )
}
