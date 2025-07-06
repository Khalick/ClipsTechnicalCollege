"use client"

import { useState, useEffect } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"

interface ClearanceRecord {
  id: string
  department: string
  department_type: string
  status: string
  cleared_by?: string
  cleared_date?: string
  notes?: string
  requirements: string[]
  pending_requirements: string[]
  progress_percentage?: number
}

interface ClearanceRequest {
  id: string
  request_type: string
  request_reason: string
  status: string
  requested_date: string
  processed_date?: string
  approved_by?: string
  notes?: string
  documents_required: string[]
  documents_submitted: string[]
  priority: string
}

interface EnhancedClearanceSectionProps {
  activeSection: string
  studentData: any
  user: any
}

export function EnhancedClearanceSection({ activeSection, studentData, user }: EnhancedClearanceSectionProps) {
  const [clearanceRecords, setClearanceRecords] = useState<ClearanceRecord[]>([])
  const [clearanceRequests, setClearanceRequests] = useState<ClearanceRequest[]>([])
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [newRequestType, setNewRequestType] = useState("")
  const [newRequestReason, setNewRequestReason] = useState("")
  const [newRequestPriority, setNewRequestPriority] = useState("normal")
  const { showToast } = useToast()

  // Fetch clearance records
  const fetchClearanceRecords = async () => {
    try {
      setIsLoading(true)
      const regNumber = studentData?.registration_number || user?.registrationNumber
      
      const response = await fetch(`/api/students/clearance/records?registrationNumber=${regNumber}`)
      const data = await response.json()
      
      if (data.success) {
        setClearanceRecords(data.data)
      } else {
        showToast(data.message || "Failed to fetch clearance records", "error")
      }
    } catch (error) {
      showToast("Error fetching clearance records", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch clearance requests
  const fetchClearanceRequests = async () => {
    try {
      setIsLoading(true)
      const regNumber = studentData?.registration_number || user?.registrationNumber
      
      const response = await fetch(`/api/students/clearance/requests?registrationNumber=${regNumber}`)
      const data = await response.json()
      
      if (data.success) {
        setClearanceRequests(data.data)
      } else {
        showToast(data.message || "Failed to fetch clearance requests", "error")
      }
    } catch (error) {
      showToast("Error fetching clearance requests", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Submit new clearance request
  const handleNewRequest = async () => {
    if (!newRequestType || !newRequestReason) {
      showToast("Please fill in all required fields", "error")
      return
    }

    try {
      setIsLoading(true)
      const regNumber = studentData?.registration_number || user?.registrationNumber
      
      const response = await fetch('/api/students/clearance/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: regNumber,
          requestType: newRequestType,
          requestReason: newRequestReason,
          priority: newRequestPriority
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        showToast("Clearance request submitted successfully", "success")
        setNewRequestType("")
        setNewRequestReason("")
        setNewRequestPriority("normal")
        fetchClearanceRequests()
      } else {
        showToast(data.message || "Failed to submit clearance request", "error")
      }
    } catch (error) {
      showToast("Error submitting clearance request", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate overall progress
  const calculateOverallProgress = () => {
    if (clearanceRecords.length === 0) return 0
    const completedCount = clearanceRecords.filter(record => record.status === "completed").length
    return Math.round((completedCount / clearanceRecords.length) * 100)
  }

  // Load data on component mount
  useEffect(() => {
    fetchClearanceRecords()
    fetchClearanceRequests()
  }, [studentData, user])

  if (activeSection !== "students-clearance" && activeSection !== "clearance-request") {
    return null
  }

  return (
    <div className="clearance-section">
      {/* Header */}
      <div className="clearance-header">
        <div>
          <h1>🎓 Student Clearance Portal</h1>
          <p>Manage your clearance requirements and track your progress</p>
        </div>
        <div className="badge">
          {calculateOverallProgress()}% Complete
        </div>
      </div>

      {/* Content Layout */}
      <div className="clearance-content">
        {/* Sidebar Navigation */}
        <div className="clearance-sidebar">
          <div className="clearance-sidebar-header">
            <h3>📋 Clearance Menu</h3>
            <p>Navigate your clearance process</p>
          </div>
          
          <nav className="clearance-nav">
            <div 
              className={`clearance-nav-item ${activeTab === "overview" ? "active" : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <span className="icon">📊</span>
              <span className="label">Overview</span>
              <span className="status-indicator completed"></span>
            </div>
            
            <div 
              className={`clearance-nav-item ${activeTab === "departments" ? "active" : ""}`}
              onClick={() => setActiveTab("departments")}
            >
              <span className="icon">🏢</span>
              <span className="label">Departments</span>
              <span className="status-indicator pending"></span>
            </div>
            
            <div 
              className={`clearance-nav-item ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              <span className="icon">📝</span>
              <span className="label">My Requests</span>
              <span className="status-indicator completed"></span>
            </div>
            
            <div 
              className={`clearance-nav-item ${activeTab === "new-request" ? "active" : ""}`}
              onClick={() => setActiveTab("new-request")}
            >
              <span className="icon">➕</span>
              <span className="label">New Request</span>
              <span className="status-indicator"></span>
            </div>
            
            <div 
              className={`clearance-nav-item ${activeTab === "documents" ? "active" : ""}`}
              onClick={() => setActiveTab("documents")}
            >
              <span className="icon">📄</span>
              <span className="label">Documents</span>
              <span className="status-indicator pending"></span>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="clearance-main">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <>
              <div className="clearance-main-header">
                <h2>📊 Clearance Overview</h2>
                <p>Your overall clearance progress and status summary</p>
              </div>
              
              <div className="clearance-main-content">
                {/* Statistics Cards */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">🏢</div>
                    <div className="stat-value">{clearanceRecords.length}</div>
                    <div className="stat-label">Total Departments</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-value">{clearanceRecords.filter(r => r.status === "completed").length}</div>
                    <div className="stat-label">Completed</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-value">{clearanceRecords.filter(r => r.status === "pending").length}</div>
                    <div className="stat-label">Pending</div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">{clearanceRequests.length}</div>
                    <div className="stat-label">Total Requests</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="progress-section">
                  <h3>Overall Progress</h3>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${calculateOverallProgress()}%` }}
                    ></div>
                  </div>
                  <p>{calculateOverallProgress()}% of clearance requirements completed</p>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity">
                  <h3>Recent Activity</h3>
                  <div className="activity-list">
                    {clearanceRequests.slice(0, 5).map((request) => (
                      <div key={request.id} className="activity-item">
                        <div className="activity-icon">📝</div>
                        <div className="activity-details">
                          <strong>{request.request_type}</strong> request submitted
                          <span className="activity-date">
                            {new Date(request.requested_date).toLocaleDateString()}
                          </span>
                        </div>
                        <span className={`clearance-status ${request.status}`}>
                          {request.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Departments Tab */}
          {activeTab === "departments" && (
            <>
              <div className="clearance-main-header">
                <h2>🏢 Department Clearances</h2>
                <p>Track your clearance status across all departments</p>
              </div>
              
              <div className="clearance-main-content">
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading clearance records...</p>
                  </div>
                ) : (
                  <div className="clearance-cards">
                    {clearanceRecords.map((record) => (
                      <div key={record.id} className={`clearance-card ${record.status}`}>
                        <div className="clearance-card-header">
                          <h4>{record.department}</h4>
                          <span className={`clearance-status ${record.status}`}>
                            {record.status}
                          </span>
                        </div>
                        
                        <div className="clearance-card-meta">
                          <div className="meta-item">
                            <span>🏷️</span>
                            <span>{record.department_type}</span>
                          </div>
                          {record.cleared_date && (
                            <div className="meta-item">
                              <span>📅</span>
                              <span>{new Date(record.cleared_date).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        
                        {record.requirements.length > 0 && (
                          <div className="clearance-requirements">
                            <h5>Requirements:</h5>
                            <ul className="requirements-list">
                              {record.requirements.map((req, index) => (
                                <li key={index}>
                                  <span className={`requirement-icon ${record.pending_requirements.includes(req) ? "pending" : "completed"}`}>
                                    {record.pending_requirements.includes(req) ? "⏳" : "✓"}
                                  </span>
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {record.notes && (
                          <div className="clearance-notes">
                            <strong>Notes:</strong>
                            <p>{record.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <>
              <div className="clearance-main-header">
                <h2>📝 My Clearance Requests</h2>
                <p>View and track all your clearance requests</p>
              </div>
              
              <div className="clearance-main-content">
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading clearance requests...</p>
                  </div>
                ) : (
                  <div className="requests-table">
                    {clearanceRequests.length > 0 ? (
                      <table>
                        <thead>
                          <tr>
                            <th>Request Type</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Priority</th>
                            <th>Requested Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {clearanceRequests.map((request) => (
                            <tr key={request.id}>
                              <td>{request.request_type}</td>
                              <td>{request.request_reason}</td>
                              <td>
                                <span className={`clearance-status ${request.status}`}>
                                  {request.status}
                                </span>
                              </td>
                              <td>
                                <span className={`priority-badge ${request.priority}`}>
                                  {request.priority}
                                </span>
                              </td>
                              <td>{new Date(request.requested_date).toLocaleDateString()}</td>
                              <td>
                                <button className="btn btn-sm btn-primary">View Details</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="empty-state">
                        <div className="empty-icon">📝</div>
                        <h3>No Requests Yet</h3>
                        <p>You haven't submitted any clearance requests yet.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* New Request Tab */}
          {activeTab === "new-request" && (
            <>
              <div className="clearance-main-header">
                <h2>➕ Submit New Clearance Request</h2>
                <p>Create a new clearance request for processing</p>
              </div>
              
              <div className="clearance-main-content">
                <div className="clearance-request-form">
                  <h3>🆕 New Clearance Request</h3>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Request Type:</label>
                      <select 
                        value={newRequestType} 
                        onChange={(e) => setNewRequestType(e.target.value)}
                        disabled={isLoading}
                        title="Select request type"
                      >
                        <option value="">Select request type</option>
                        <option value="academic">Academic Clearance</option>
                        <option value="financial">Financial Clearance</option>
                        <option value="library">Library Clearance</option>
                        <option value="hostel">Hostel Clearance</option>
                        <option value="general">General Clearance</option>
                        <option value="graduation">Graduation Clearance</option>
                        <option value="transfer">Transfer Clearance</option>
                        <option value="withdrawal">Withdrawal Clearance</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label htmlFor="priority-select">Priority:</label>
                      <select 
                        id="priority-select"
                        value={newRequestPriority} 
                        onChange={(e) => setNewRequestPriority(e.target.value)}
                        disabled={isLoading}
                      >
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="form-group">
                    <label>Reason/Purpose:</label>
                    <textarea 
                      value={newRequestReason}
                      onChange={(e) => setNewRequestReason(e.target.value)}
                      placeholder="Please provide detailed reason for your clearance request..."
                      rows={4}
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setNewRequestType("")
                        setNewRequestReason("")
                        setNewRequestPriority("normal")
                      }}
                      disabled={isLoading}
                    >
                      Clear Form
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleNewRequest}
                      disabled={isLoading || !newRequestType || !newRequestReason}
                    >
                      {isLoading ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </div>

                {/* Guidelines */}
                <div className="clearance-guidelines">
                  <h3>📋 Request Guidelines</h3>
                  <ul>
                    <li>Clearance requests are processed within 3-5 business days</li>
                    <li>Ensure all required documents are submitted with your request</li>
                    <li>You will be notified via email when your request is processed</li>
                    <li>For urgent requests, contact the relevant department directly</li>
                    <li>Academic clearances may require completion of all course requirements</li>
                    <li>Financial clearances require all outstanding fees to be paid</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* Documents Tab */}
          {activeTab === "documents" && (
            <>
              <div className="clearance-main-header">
                <h2>📄 Clearance Documents</h2>
                <p>Manage documents required for your clearance</p>
              </div>
              
              <div className="clearance-main-content">
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>Document Management</h3>
                  <p>Document upload and management features coming soon.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
