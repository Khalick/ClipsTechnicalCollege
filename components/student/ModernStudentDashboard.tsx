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
  total_billed: number
  semester_fee: number
  current_semester_fee?: number
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
  const [welcomeExpanded, setWelcomeExpanded] = useState(false)
  const [showUpdateProfile, setShowUpdateProfile] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)

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

      // Fetch registered units
      if (user?.id) {
        const unitsResponse = await fetch(`/api/students/registered-units?student_id=${user.id}`)
        if (unitsResponse.ok) {
          const unitsResult = await unitsResponse.json()
          if (unitsResult.success) {
            setUnits(unitsResult.registered_units)
          }
        }
      }

    } catch (error) {
      console.error("Error fetching student data:", error)
      showToast("Error loading data", "error")
    } finally {
      setIsLoading(false)
    }
  }

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

  const handleWelcomeClick = () => {
    setWelcomeExpanded(!welcomeExpanded)
  }

  const handleUpdateProfile = async (updatedData: Partial<StudentData>) => {
    if (!user?.registrationNumber) return

    try {
      setIsUpdating(true)
      
      const response = await fetch(`/api/students/profile/${user.registrationNumber}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setStudentData(result.data)
          showToast("Profile updated successfully", "success")
          setShowUpdateProfile(false)
        } else {
          showToast(result.message || "Failed to update profile", "error")
        }
      } else {
        showToast("Failed to update profile", "error")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      showToast("Error updating profile", "error")
    } finally {
      setIsUpdating(false)
    }
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
              <span 
                className="welcome-text clickable" 
                onClick={handleWelcomeClick}
              >
                Welcome: {studentData?.name || user?.name} {welcomeExpanded ? '▲' : '▼'}
              </span>
              {welcomeExpanded && (
                <div className="nav-buttons">
                  <button className="profile-btn" onClick={() => setActiveSection('dashboard')} title="Profile">
                    Profile
                  </button>
                  <button className="logout-btn" onClick={logout} title="Logout" aria-label="Logout">
                    <LogOutIcon />
                    Logout
                  </button>
                </div>
              )}
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
                    <p className="amount">{formatCurrency(fees?.total_billed || 0)}</p>
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
                      <button className="update-profile-btn" onClick={() => setShowUpdateProfile(true)}>Update Profile</button>
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
              <UnitRegistration units={units} onUnitsChange={fetchRegisteredUnits} />
            </div>
          )}

          {activeSection === "provisional-results" && (
            <div className="section-content">
              <AcademicsSection 
                activeSection={activeSection}
                units={units}
                onUnitsChange={fetchRegisteredUnits}
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

      {/* Update Profile Modal */}
      {showUpdateProfile && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Update Profile</h3>
              <button className="modal-close" onClick={() => setShowUpdateProfile(false)}>×</button>
            </div>
            <div className="modal-body">
              <UpdateProfileForm
                studentData={studentData}
                onUpdate={handleUpdateProfile}
                onCancel={() => setShowUpdateProfile(false)}
                isUpdating={isUpdating}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Update Profile Form Component
interface UpdateProfileFormProps {
  studentData: StudentData | null
  onUpdate: (data: Partial<StudentData>) => void
  onCancel: () => void
  isUpdating: boolean
}

function UpdateProfileForm({ studentData, onUpdate, onCancel, isUpdating }: UpdateProfileFormProps) {
  const [formData, setFormData] = useState({
    name: studentData?.name || "",
    email: studentData?.email || "",
    phone: "",
    postal_address: "",
    clips_email: studentData?.email || "",
    gender: "Male",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    next_of_kin_name: "",
    next_of_kin_phone: "",
    next_of_kin_relationship: ""
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="update-profile-form">
      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="clips_email">CLIPS Email</label>
          <input
            type="email"
            id="clips_email"
            name="clips_email"
            value={formData.clips_email}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full-width">
          <label htmlFor="postal_address">Postal Address</label>
          <input
            type="text"
            id="postal_address"
            name="postal_address"
            value={formData.postal_address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="emergency_contact_name">Emergency Contact Name</label>
          <input
            type="text"
            id="emergency_contact_name"
            name="emergency_contact_name"
            value={formData.emergency_contact_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="emergency_contact_phone">Emergency Contact Phone</label>
          <input
            type="tel"
            id="emergency_contact_phone"
            name="emergency_contact_phone"
            value={formData.emergency_contact_phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="next_of_kin_name">Next of Kin Name</label>
          <input
            type="text"
            id="next_of_kin_name"
            name="next_of_kin_name"
            value={formData.next_of_kin_name}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="next_of_kin_phone">Next of Kin Phone</label>
          <input
            type="tel"
            id="next_of_kin_phone"
            name="next_of_kin_phone"
            value={formData.next_of_kin_phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="next_of_kin_relationship">Next of Kin Relationship</label>
          <input
            type="text"
            id="next_of_kin_relationship"
            name="next_of_kin_relationship"
            value={formData.next_of_kin_relationship}
            onChange={handleChange}
            placeholder="e.g., Parent, Sibling, Spouse"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="cancel-btn">
          Cancel
        </button>
        <button type="submit" disabled={isUpdating} className="save-btn">
          {isUpdating ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </form>
  )
}
