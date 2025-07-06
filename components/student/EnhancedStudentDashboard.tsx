"use client"

import { useEffect, useState, useMemo } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"
import { StudentProfile } from "./StudentProfile"
import { UnitRegistration } from "./UnitRegistration"
import { FeeInformation } from "./FeeInformation"
import { DocumentsSection } from "./DocumentsSection"
import { DashboardSkeleton } from "@/components/ui/loading-skeleton"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { Bell, Download, Calendar, BookOpen, CreditCard, FileText, TrendingUp, Menu, X } from "lucide-react"
import Image from "next/image"
import "@/styles/dashboard.css"

interface StudentData {
  id: string
  name: string
  registration_number: string
  course: string
  level_of_study: string
  status: string
  national_id?: string
  date_of_birth?: string
  email?: string
  photo_url?: string
}

interface UnitData {
  id: string
  name: string
  code: string
  status: string
}

interface FeeData {
  fee_balance: number
  total_paid: number
  semester_fee: number
  session_progress: number
  fees: Array<{
    id: string
    semester: string
    total_fee: number
    amount_paid: number
    balance: number
    due_date: string
    created_at: string
  }>
  payments: Array<{
    id: string
    amount: number
    payment_date: string
    payment_method: string
    reference_number: string
    notes: string
  }>
}

export function EnhancedStudentDashboard() {
  const { user, logout, isLoading: authLoading } = useStudentAuth()
  const { showToast } = useToast()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [units, setUnits] = useState<UnitData[]>([])
  const [fees, setFees] = useState<FeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchStudentData()
    }
  }, [authLoading, user])

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isMobileMenuOpen])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMobileMenuOpen])

  const dashboardStats = useMemo(() => {
    if (!fees || !units) return null
    
    return {
      totalUnits: units.length,
      activeUnits: units.filter(u => u.status === 'active').length,
      feeBalance: fees.fee_balance,
      paymentStatus: fees.fee_balance > 0 ? 'pending' : 'paid',
      sessionProgress: fees.session_progress || 0
    }
  }, [fees, units])

  const fetchRegisteredUnits = async () => {
    if (!user?.id) return
    
    try {
      const unitsResponse = await fetch(`/api/students/registered-units?student_id=${user.id}`)
      if (unitsResponse.ok) {
        const unitsResult = await unitsResponse.json()
        if (unitsResult.success) {
          setUnits(unitsResult.registered_units)
        }
      }
    } catch (error) {
      console.error("Error fetching registered units:", error)
    }
  }

  const fetchStudentData = async () => {
    if (!user?.registrationNumber) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const regNumber = user.registrationNumber
      
      // Fetch fee data
      const feeResponse = await fetch(`/api/students/fees/${regNumber}`)
      if (feeResponse.ok) {
        const feeResult = await feeResponse.json()
        if (feeResult.success) {
          setFees(feeResult.data)
        } else {
          setFees({
            fee_balance: 133200,
            total_paid: 42800,
            semester_fee: 56120,
            session_progress: 65,
            fees: [],
            payments: []
          })
        }
      }

      // Fetch profile data
      const profileResponse = await fetch(`/api/students/profile/${regNumber}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.success) {
          setStudentData(profileData.data)
        } else {
          setStudentData({
            id: "1",
            name: user?.name || "Student Name",
            registration_number: regNumber,
            course: "Computer Science",
            level_of_study: "Year 2 Semester 1",
            status: "active",
            national_id: "12345678",
            date_of_birth: "1995-01-01",
            email: "student@example.com",
          })
        }
      }

      await fetchRegisteredUnits()
    } catch (error) {
      console.error("Error loading student data:", error)
      showToast("Error loading student data", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    closeMobileMenu()
    // Smooth scroll to section
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="student-dashboard">
        <div className="container">
          <header>
            <div className="header-content">
              <div className="logo-container">
                <div className="logo-img loading-placeholder" />
                <div className="logo-text">Loading...</div>
              </div>
            </div>
          </header>
          <DashboardSkeleton />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <ErrorBoundary>
      <div className="student-dashboard">
        <div className="container">
          <header>
            <div className="header-content">
              <div className="logo-container">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-PKLKzzAhhXiO6YgHjD6hzdOTjB8KBT.jpeg"
                  alt="CLIPS Logo"
                  width={70}
                  height={70}
                  className="logo-img"
                />
                <div className="logo-text">CLIPS Technical College</div>
              </div>
              <div className="user-info">
                <div>{studentData?.name}</div>
                <div>{studentData?.registration_number}</div>
              </div>
              <div className="logout-container">
                <button className="logout-btn" onClick={logout}>
                  Logout
                </button>
                <button 
                  className={`hamburger-menu ${isMobileMenuOpen ? 'active' : ''}`}
                  onClick={toggleMobileMenu}
                  aria-label="Toggle navigation menu"
                >
                  <span></span>
                  <span></span>
                  <span></span>
                </button>
              </div>
            </div>
          </header>

          <nav>
            <div className="nav-menu">
              <div className="nav-item">
                <a href="#dashboard" onClick={(e) => handleNavClick(e, '#dashboard')}>Dashboard</a>
              </div>
              <div className="nav-item">
                <a href="#fees" onClick={(e) => handleNavClick(e, '#fees')}>Fees</a>
              </div>
              <div className="nav-item">
                <a href="#units" onClick={(e) => handleNavClick(e, '#units')}>Units</a>
              </div>
              <div className="nav-item">
                <a href="#documents" onClick={(e) => handleNavClick(e, '#documents')}>Documents</a>
              </div>
              <div className="nav-item">
                <a href="#profile" onClick={(e) => handleNavClick(e, '#profile')}>Profile</a>
              </div>
            </div>
          </nav>

          {/* Mobile Navigation Overlay */}
          <div 
            className={`nav-mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`}
            onClick={closeMobileMenu}
          ></div>

          {/* Mobile Navigation Menu */}
          <nav className={`nav-mobile ${isMobileMenuOpen ? 'active' : ''}`}>
            <button 
              className="nav-close"
              onClick={closeMobileMenu}
              aria-label="Close navigation menu"
            >
              <X size={24} />
            </button>
            <div className="nav-menu">
              <div className="nav-item">
                <a href="#dashboard" onClick={(e) => handleNavClick(e, '#dashboard')}>Dashboard</a>
              </div>
              <div className="nav-item">
                <a href="#fees" onClick={(e) => handleNavClick(e, '#fees')}>Fees</a>
              </div>
              <div className="nav-item">
                <a href="#units" onClick={(e) => handleNavClick(e, '#units')}>Units</a>
              </div>
              <div className="nav-item">
                <a href="#documents" onClick={(e) => handleNavClick(e, '#documents')}>Documents</a>
              </div>
              <div className="nav-item">
                <a href="#profile" onClick={(e) => handleNavClick(e, '#profile')}>Profile</a>
              </div>
            </div>
          </nav>

          {/* Quick Stats */}
          {dashboardStats && (
            <div className="dashboard" id="dashboard">
              <div className="card2">
                <h2><BookOpen size={20} /> Total Units</h2>
                <div className="fee-value">{dashboardStats.totalUnits}</div>
              </div>
              <div className="card2">
                <h2><Calendar size={20} /> Active Units</h2>
                <div className="fee-value">{dashboardStats.activeUnits}</div>
              </div>
              <div className="card2">
                <h2><CreditCard size={20} /> Fee Balance</h2>
                <div className="fee-value">KSh {dashboardStats.feeBalance.toLocaleString()}</div>
              </div>
              <div className="card2">
                <h2><TrendingUp size={20} /> Session Progress</h2>
                <div className="fee-value">{dashboardStats.sessionProgress}%</div>
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="dashboard-container">
            <div className="dashboard">
              <div id="fees">
                <FeeInformation fees={fees} onRefresh={fetchStudentData} />
              </div>
              <div id="units">
                <UnitRegistration units={units} onUnitsChange={setUnits} />
              </div>
              <div id="documents">
                <DocumentsSection registrationNumber={studentData?.registration_number || user?.registrationNumber || ""} />
              </div>
            </div>
            <div id="profile">
              <StudentProfile studentData={studentData} onDataChange={setStudentData} />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

// Helper functions
const downloadDocument = (type: string) => {
  console.log(`Downloading ${type}`)
}

const showResults = () => {
  console.log("Showing results")
}

const showTimetable = () => {
  console.log("Showing timetable")
}