"use client"

import { useEffect, useState } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"
import { StudentProfile } from "./StudentProfile"
import { UnitRegistration } from "./UnitRegistration"
import { FeeInformation } from "./FeeInformation"
import { DocumentsSection } from "./DocumentsSection"
import Image from "next/image"

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
}

export function StudentDashboard() {
  const { user, logout, isLoading: authLoading } = useStudentAuth()
  const { showToast } = useToast()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [units, setUnits] = useState<UnitData[]>([])
  const [fees, setFees] = useState<FeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && user) {
      fetchStudentData()
    }
  }, [authLoading, user])

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
      
      // Use the cached registration number from authenticated user
      const regNumber = user.registrationNumber
      
      // Fetch real fee data from the API
      const feeResponse = await fetch(`/api/students/fees/${regNumber}`)
      if (feeResponse.ok) {
        const feeResult = await feeResponse.json()
        if (feeResult.success) {
          setFees(feeResult.data)
        } else {
          console.error("Failed to fetch fees:", feeResult.error)
          // Fallback to mock data if API fails
          setFees({
            fee_balance: 133200,
            total_paid: 42800,
            semester_fee: 56120,
            session_progress: 65
          })
        }
      } else {
        console.error("Fee API error:", feeResponse.status)
        // Fallback to mock data if API fails
        setFees({
          fee_balance: 133200,
          total_paid: 42800,
          semester_fee: 56120,
          session_progress: 65
        })
      }

      // Fetch student profile data
      const profileResponse = await fetch(`/api/students/profile/${regNumber}`)
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        if (profileData.success) {
          setStudentData({
            id: profileData.data.id,
            name: profileData.data.name,
            registration_number: profileData.data.registration_number,
            course: profileData.data.course,
            level_of_study: profileData.data.level_of_study,
            status: profileData.data.status,
            national_id: profileData.data.national_id,
            date_of_birth: profileData.data.date_of_birth,
            email: profileData.data.email,
            photo_url: profileData.data.photo_url,
          })
        } else {
          console.error("Profile API error:", profileData.error)
          // Fallback to mock data if API fails
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
            photo_url: "/placeholder-user.jpg",
          })
        }
      } else {
        console.error("Profile API error:", profileResponse.status)
        // Fallback to mock data if API fails
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
          photo_url: "/placeholder-user.jpg",
        })
      }

      // Fetch registered units after getting student data
      await fetchRegisteredUnits()
    } catch (error) {
      console.error("Error loading student data:", error)
      showToast("Error loading student data", "error")
      
      // Fallback to mock data on error
      setFees({
        fee_balance: 133200,
        total_paid: 42800,
        semester_fee: 56120,
        session_progress: 65
      })
      
      setStudentData({
        id: "1",
        name: user?.name || "Student Name",
        registration_number: user?.registrationNumber || "Unknown",
        course: "Computer Science",
        level_of_study: "Year 2 Semester 1",
        status: "active",
        national_id: "12345678",
        date_of_birth: "1995-01-01",
        email: "student@example.com",
        photo_url: "/placeholder-user.jpg",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="student-dashboard">
      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo-container">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-PKLKzzAhhXiO6YgHjD6hzdOTjB8KBT.jpeg"
                alt="CLIPS Logo"
                width={70}
                height={70}
                className="logo-img"
              />
              <div className="logo-text">CLIPS TECHNICAL COLLEGE</div>
            </div>
            <div className="logout-container">
              <div className="user-info">Welcome back, {studentData?.name}</div>
              <button className="logout-btn" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav>
        <div className="container">
          <ul className="nav-menu">
            <li className="nav-item">
              <a href="#student-info">Dashboard</a>
            </li>
            <li className="nav-item">
              <a href="#finance">Finance</a>
              <div className="dropdown-menu">
                <a href="#" onClick={() => downloadDocument("fee-statement")}>
                  Fee Statement
                </a>
                <a href="#" onClick={() => downloadDocument("fee-receipt")}>
                  Financial Receipt
                </a>
              </div>
            </li>
            <li className="nav-item">
              <a href="#units-registered">Academics</a>
              <div className="dropdown-menu">
                <a href="#exam-card">Exam Card</a>
                <a href="#" onClick={() => showResults()}>
                  Results
                </a>
                <a href="#units-available">Register Units</a>
                <a href="#documents">My Documents</a>
              </div>
            </li>
            <li className="nav-item">
              <a href="#" onClick={() => showTimetable()}>
                Timetable
              </a>
            </li>
          </ul>
        </div>
      </nav>

      <div className="container">
        <div className="dashboard-container">
          <div className="dashboard">
            <FeeInformation fees={fees} onRefresh={fetchStudentData} />
            <UnitRegistration units={units} onUnitsChange={setUnits} />
            <DocumentsSection registrationNumber={studentData?.registration_number || user?.registrationNumber || ""} />
          </div>

          <StudentProfile studentData={studentData} onDataChange={setStudentData} />
        </div>
      </div>
    </div>
  )
}

// Helper functions
const downloadDocument = (type: string) => {
  console.log(`Downloading ${type}`)
  // Implement document download logic
}

const showResults = () => {
  console.log("Showing results")
  // Implement results display
}

const showTimetable = () => {
  console.log("Showing timetable")
  // Implement timetable display
}
