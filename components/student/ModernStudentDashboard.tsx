"use client"

import { useEffect, useState } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"
import { StudentProfile } from "./StudentProfile"
import { UnitRegistration } from "./UnitRegistration"
import { FeeInformation } from "./FeeInformation"
import { DocumentsSection } from "./DocumentsSection"
import { ExamCardGenerator } from "./ExamCardGenerator"
import { AcademicsSection } from "./AcademicsSection"
import { EnhancedClearanceSection } from "./EnhancedClearanceSection"
import EnhancedFinanceSection  from "./EnhancedFinanceSection"
import SettingsSection from "./SettingsSection"
import Image from "next/image"

// Simple icon components as fallback
const HomeIcon = () => <span>🏠</span>
const DollarIcon = () => <span>💰</span>
const BookIcon = () => <span>📚</span>
const FileIcon = () => <span>📄</span>
const SettingsIcon = () => <span>⚙️</span>
const LogOutIcon = () => <span>🚪</span>
const StarIcon = () => <span>⭐</span>
const CreditCardIcon = () => <span>💳</span>
const FileTextIcon = () => <span>📝</span>
const ChevronDownIcon = () => <span>▼</span>
const ChevronRightIcon = () => <span>▶</span>

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
  fees: any
  payments: any
}

export function StudentDashboard() {
  const { user, logout, isLoading: authLoading } = useStudentAuth()
  const { showToast } = useToast()
  const [studentData, setStudentData] = useState<StudentData | null>(null)
  const [units, setUnits] = useState<UnitData[]>([])
  const [fees, setFees] = useState<FeeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showExamCard, setShowExamCard] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [academicsExpanded, setAcademicsExpanded] = useState(false)
  const [clearanceExpanded, setClearanceExpanded] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      fetchStudentData()
    }
  }, [authLoading, user])

  const fetchStudentData = async () => {
    if (!user?.registrationNumber) return

    try {
      setIsLoading(true)
      
      // Fetch student profile
      const profileResponse = await fetch(`/api/students/profile/${user.registrationNumber}`)
      if (profileResponse.ok) {
        const profileResult = await profileResponse.json()
        if (profileResult.success) {
          setStudentData(profileResult.data)
        }
      }

      // Fetch fee data
      const feeResponse = await fetch(`/api/students/fees/${user.registrationNumber}`)
      if (feeResponse.ok) {
        const feeResult = await feeResponse.json()
        if (feeResult.success) {
          setFees(feeResult.data)
        }
      }

      // Fetch units
      const unitsResponse = await fetch(`/api/students/units/${user.registrationNumber}`)
      if (unitsResponse.ok) {
        const unitsResult = await unitsResponse.json()
        if (unitsResult.success) {
          setUnits(unitsResult.data)
        }
      }

    } catch (error) {
      console.error("Error fetching student data:", error)
      showToast("Error loading data", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: HomeIcon },
    { id: "financials", label: "Financials", icon: DollarIcon },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ]

  const academicsSubItems = [
    { id: "register-units", label: "Register Units", icon: BookIcon },
    { id: "provisional-results", label: "Provisional Results", icon: FileIcon },
    { id: "lecturer-evaluation", label: "Lecturer Evaluation", icon: StarIcon },
    { id: "exam-cards", label: "Exam Cards", icon: CreditCardIcon },
    { id: "academic-requisitions", label: "Academic Requisitions", icon: FileTextIcon },
  ]

  const clearanceSubItems = [
    { id: "students-clearance", label: "Students Clearance", icon: FileIcon },
    { id: "clearance-request", label: "Clearance Request", icon: FileTextIcon },
  ]

  const handleAcademicsClick = () => {
    setAcademicsExpanded(!academicsExpanded)
  }

  const handleAcademicsSubItemClick = (subItemId: string) => {
    setActiveSection(subItemId)
  }

  const handleClearanceClick = () => {
    setClearanceExpanded(!clearanceExpanded)
  }

  const handleClearanceSubItemClick = (subItemId: string) => {
    setActiveSection(subItemId)
  }

  return (
    <div className="modern-dashboard">
      {/* Top Navigation Bar */}
      <nav className="top-nav">
        <div className="nav-container">
          <div className="nav-left">
            <div className="logo-section">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo.jpg-PKLKzzAhhXiO6YgHjD6hzdOTjB8KBT.jpeg"
                alt="CLIPS Logo"
                width={40}
                height={40}
                className="nav-logo"
              />
              <span className="portal-title">CLIPS Students Portal</span>
            </div>
          </div>
          
          <div className="nav-right">
            <div className="welcome-banner">
              Welcome to the new student portal. For any assistance contact the ICT Department
            </div>
            <div className="user-section">
              <span className="welcome-text">Welcome: {studentData?.name || user?.name}</span>
              <div className="nav-buttons">
                <button className="profile-btn" onClick={() => setActiveSection('dashboard')} title="Profile">
                  Profile
                </button>
                <button className="logout-btn" onClick={logout} title="Logout" aria-label="Logout">
                  <LogOutIcon />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="user-avatar">
              <Image
                src={studentData?.photo_url || "/placeholder-user.jpg"}
                alt="Student Photo"
                width={60}
                height={60}
                className="avatar-img"
              />
            </div>
            <div className="user-status">
              <span className="online-indicator">● Online</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            <h3 className="nav-title">MAIN NAVIGATION</h3>
            <ul className="nav-menu">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
                      onClick={() => setActiveSection(item.id)}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </button>
                  </li>
                )
              })}
              
              {/* Academics Collapsible Section */}
              <li>
                <button
                  className={`nav-item academics-toggle ${academicsExpanded ? 'expanded' : ''}`}
                  onClick={handleAcademicsClick}
                >
                  <BookIcon />
                  <span>Academics</span>
                  {academicsExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                </button>
                
                {academicsExpanded && (
                  <ul className="academics-submenu">
                    {academicsSubItems.map((subItem) => {
                      const SubIcon = subItem.icon
                      return (
                        <li key={subItem.id}>
                          <button
                            className={`nav-sub-item ${activeSection === subItem.id ? 'active' : ''}`}
                            onClick={() => handleAcademicsSubItemClick(subItem.id)}
                          >
                            <SubIcon />
                            <span>{subItem.label}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>

              {/* Clearance Collapsible Section */}
              <li>
                <button
                  className={`nav-item clearance-toggle ${clearanceExpanded ? 'expanded' : ''}`}
                  onClick={handleClearanceClick}
                >
                  <FileIcon />
                  <span>Students Clearance</span>
                  {clearanceExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                </button>
                
                {clearanceExpanded && (
                  <ul className="clearance-submenu">
                    {clearanceSubItems.map((subItem) => {
                      const SubIcon = subItem.icon
                      return (
                        <li key={subItem.id}>
                          <button
                            className={`nav-sub-item ${activeSection === subItem.id ? 'active' : ''}`}
                            onClick={() => handleClearanceSubItemClick(subItem.id)}
                          >
                            <SubIcon />
                            <span>{subItem.label}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="main-content">
          {activeSection === "dashboard" && (
            <div className="dashboard-section">
              {/* Financial Cards */}
              <div className="financial-cards">
                <div className="card total-billed">
                  <div className="card-icon">
                    <FileIcon />
                  </div>
                  <div className="card-content">
                    <h3>TOTAL BILLED:</h3>
                    <p className="amount">{formatCurrency(fees?.semester_fee || 0)}</p>
                    <button className="card-btn">View Details ●</button>
                  </div>
                </div>

                <div className="card total-paid">
                  <div className="card-icon">
                    <CreditCardIcon />
                  </div>
                  <div className="card-content">
                    <h3>TOTAL PAID:</h3>
                    <p className="amount">{formatCurrency(fees?.total_paid || 0)}</p>
                    <button className="card-btn">View Details ●</button>
                  </div>
                </div>

                <div className="card balance">
                  <div className="card-icon">
                    <DollarIcon />
                  </div>
                  <div className="card-content">
                    <h3>BALANCE:</h3>
                    <p className="amount">{formatCurrency(fees?.fee_balance || 0)}</p>
                    <button className="card-btn">View Details ●</button>
                  </div>
                </div>
              </div>

              {/* Profile Section */}
              <div className="profile-section">
                <div className="profile-card">
                  <div className="profile-header">
                    <h3>User Profile</h3>
                    <div className="profile-actions">
                      <button className="minimize-btn">—</button>
                      <button className="close-btn">×</button>
                    </div>
                  </div>
                  
                  <div className="profile-content">
                    <div className="profile-left">
                      <div className="profile-avatar">
                        <Image
                          src={studentData?.photo_url || "/placeholder-user.jpg"}
                          alt="Student Photo"
                          width={120}
                          height={120}
                          className="profile-img"
                        />
                      </div>
                      <h4 className="profile-name">{studentData?.registration_number || user?.registrationNumber}</h4>
                      <div className="profile-program">
                        <span className="program-icon">🎓</span>
                        <span>Programme</span>
                        <p>{studentData?.course || "Computer Science"}</p>
                      </div>
                      <div className="profile-stage">
                        <select className="stage-select" title="Select your current academic stage">
                          <option>My Stage</option>
                          <option>{studentData?.level_of_study || "Year 1 Semester 1"}</option>
                        </select>
                      </div>
                    </div>

                    <div className="profile-right">
                      <h4>Personal Information</h4>
                      <div className="info-grid">
                        <div className="info-item">
                          <label>Admission No:</label>
                          <span>{studentData?.registration_number || user?.registrationNumber}</span>
                        </div>
                        <div className="info-item">
                          <label>ID/Passport:</label>
                          <span>{studentData?.national_id || "Not provided"}</span>
                        </div>
                        <div className="info-item">
                          <label>Full Name:</label>
                          <span>{studentData?.name || user?.name}</span>
                        </div>
                        <div className="info-item">
                          <label>Gender:</label>
                          <span>Male</span>
                        </div>
                        <div className="info-item">
                          <label>Date of Birth:</label>
                          <span>{studentData?.date_of_birth ? new Date(studentData.date_of_birth).toLocaleDateString() : "Not provided"}</span>
                        </div>
                        <div className="info-item">
                          <label>Phone Number:</label>
                          <span>Not provided</span>
                        </div>
                        <div className="info-item">
                          <label>Email Address:</label>
                          <span>{studentData?.email || "Not provided"}</span>
                        </div>
                        <div className="info-item">
                          <label>Postal Address:</label>
                          <span>Not provided</span>
                        </div>
                        <div className="info-item">
                          <label>CLIPS Email:</label>
                          <span>{studentData?.email || "Not provided"}</span>
                        </div>
                      </div>
                      <button className="update-profile-btn">Update Profile</button>
                      <button className="make-payment-btn">Make Payment</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "financials" && (
            <div className="section-content">
              <EnhancedFinanceSection 
                fees={fees}
                studentData={studentData}
                onRefresh={fetchStudentData}
              />
            </div>
          )}

          {activeSection === "register-units" && (
            <div className="section-content">
              <UnitRegistration units={units} onUnitsChange={setUnits} />
            </div>
          )}

          {activeSection === "provisional-results" && (
            <div className="section-content">
              <AcademicsSection 
                activeSection={activeSection}
                units={units}
                onUnitsChange={setUnits}
                studentData={studentData}
                user={user}
              />
            </div>
          )}

          {activeSection === "lecturer-evaluation" && (
            <div className="section-content">
              <AcademicsSection 
                activeSection={activeSection}
                units={units}
                onUnitsChange={setUnits}
                studentData={studentData}
                user={user}
              />
            </div>
          )}

          {activeSection === "exam-cards" && (
            <div className="section-content">
              <div className="exam-cards-section">
                <h2>Exam Cards</h2>
                <div className="exam-card-generator">
                  <div className="generator-header">
                    <h3>Generate Exam Card</h3>
                    <p>Download your exam card for the current semester</p>
                  </div>
                  <div className="generator-content">
                    <button 
                      className="generate-exam-card-btn"
                      onClick={() => setShowExamCard(true)}
                    >
                      Generate Exam Card
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "academic-requisitions" && (
            <div className="section-content">
              <AcademicsSection 
                activeSection={activeSection}
                units={units}
                onUnitsChange={setUnits}
                studentData={studentData}
                user={user}
              />
            </div>
          )}

          {activeSection === "students-clearance" && (
            <div className="section-content">
              <EnhancedClearanceSection 
                activeSection={activeSection}
                studentData={studentData}
                user={user}
              />
            </div>
          )}

          {activeSection === "clearance-request" && (
            <div className="section-content">
              <EnhancedClearanceSection 
                activeSection={activeSection}
                studentData={studentData}
                user={user}
              />
            </div>
          )}

          {activeSection === "clearance" && (
            <div className="section-content">
              <DocumentsSection registrationNumber={studentData?.registration_number || user?.registrationNumber || ""} />
            </div>
          )}

          {activeSection === "settings" && (
            <div className="section-content">
              <SettingsSection 
                studentData={studentData}
                onStudentDataChange={setStudentData}
                user={user}
              />
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <p>Copyright © 2025 <a href="#">CLIPS Technical College</a>. Powered by <a href="#">CLIPS Solutions Limited</a></p>
      </footer>

      <ExamCardGenerator
        isOpen={showExamCard}
        onClose={() => setShowExamCard(false)}
        studentData={{
          name: studentData?.name || user?.name || "Student Name",
          registration_number: studentData?.registration_number || user?.registrationNumber || "Unknown",
          level_of_study: studentData?.level_of_study || "Year 1 Semester 1",
          course: studentData?.course || "Computer Science"
        }}
        units={units.map(unit => ({
          code: unit.code || unit.id,
          name: unit.name
        }))}
      />
    </div>
  )
}
