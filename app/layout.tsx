import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/hooks/useAuth"
import { StudentAuthProvider } from "@/hooks/useStudentAuth"
import { ToastProvider } from "@/hooks/useToast"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "CLIPS Technical College - Student Portal | Academic Management System",
  description: "Access your student portal at CLIPS Technical College. View fees, register units, download exam cards, check results and manage your academic records online.",
  keywords: "CLIPS Technical College, student portal, academic management, fee statement, unit registration, exam card, student results, technical education Kenya",
  authors: [{ name: "CLIPS Technical College" }],
  creator: "CLIPS Technical College",
  publisher: "CLIPS Technical College",
  robots: "index, follow",
  openGraph: {
    title: "CLIPS Technical College Student Portal",
    description: "Secure student portal for CLIPS Technical College students to manage academic records, fees, and course registration.",
    type: "website",
    locale: "en_KE",
    siteName: "CLIPS Technical College"
  },
  twitter: {
    card: "summary",
    title: "CLIPS Technical College Student Portal",
    description: "Access your student records and manage your academic journey at CLIPS Technical College."
  },
  generator: 'v0.dev',
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png"
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://clipstech.edu" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#af045a" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <ToastProvider>
              <AuthProvider>
                <StudentAuthProvider>{children}</StudentAuthProvider>
              </AuthProvider>
            </ToastProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
