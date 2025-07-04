import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { StudentAuthProvider } from "@/hooks/useStudentAuth"
import { ToastProvider } from "@/hooks/useToast"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CLIPS Technical College Portal",
  description: "Student and Admin Portal for CLIPS Technical College",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ToastProvider>
          <AuthProvider>
            <StudentAuthProvider>{children}</StudentAuthProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}
