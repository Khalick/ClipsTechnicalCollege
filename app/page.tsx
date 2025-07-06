"use client"
import { StudentLoginForm } from "@/components/student/StudentLoginForm"
import { StudentDashboard } from "@/components/student/ModernStudentDashboard"
import { ToastContainer } from "@/components/ToastContainer"
import { StudentPasswordResetForm } from "@/components/student/StudentPasswordResetForm"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import "../styles/modern-dashboard.css"
import "../styles/kyu-login.css"

export default function StudentPortal() {
  const { isAuthenticated, isLoading, showPasswordReset, user, completePasswordReset } = useStudentAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  return (
    <main>
      <ToastContainer />
      {showPasswordReset && user ? (
        <StudentPasswordResetForm 
          userId={user.id} 
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
