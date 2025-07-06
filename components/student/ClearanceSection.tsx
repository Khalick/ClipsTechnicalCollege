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
}

interface ClearanceSectionProps {
  activeSection: string
  studentData: any
  user: any
}

export function ClearanceSection({ activeSection, studentData, user }: ClearanceSectionProps) {
  const [clearanceRecords, setClearanceRecords] = useState<ClearanceRecord[]>([])
  const [clearanceRequests, setClearanceRequests] = useState<ClearanceRequest[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [newRequestType, setNewRequestType] = useState("")
  const [newRequestReason, setNewRequestReason] = useState("")
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
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        showToast("Clearance request submitted successfully", "success")
        setNewRequestType("")
        setNewRequestReason("")
        fetchClearanceRequests() // Refresh the list
      } else {
        showToast(data.message || "Failed to submit clearance request", "error")
      }
    } catch (error) {
      showToast("Error submitting clearance request", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Load data based on active section
  useEffect(() => {
    if (activeSection === "students-clearance") {
      fetchClearanceRecords()
    } else if (activeSection === "clearance-request") {
      fetchClearanceRequests()
    }
  }, [activeSection, studentData, user])

  if (activeSection === "students-clearance") {
    return (
      <div className="clearance-section">
        <div className="section-header">
          <h2>🎓 Student Clearance Status</h2>
          <p>View your clearance status across all departments and requirements</p>
        </div>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading clearance records...</p>
          </div>
        ) : (
          <div className="clearance-container">
            {clearanceRecords.length > 0 ? (
              <div className="clearance-grid">
                {clearanceRecords.map((record) => (
                  <div key={record.id} className="clearance-card">
                    <div className="clearance-header">
                      <h4>{record.department}</h4>
                      <span className={`status ${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </div>
                    
                    <div className="clearance-details">
                      <div className="department-type">
                        <strong>Type:</strong> {record.department_type}
                      </div>
                      
                      {record.status === "cleared" && (
                        <div className="clearance-info">
                          <p><strong>Cleared by:</strong> {record.cleared_by}</p>
                          <p><strong>Date:</strong> {new Date(record.cleared_date || "").toLocaleDateString()}</p>
                        </div>
                      )}
                      
                      {record.requirements.length > 0 && (
                        <div className="requirements">
                          <h5>Requirements:</h5>
                          <ul>
                            {record.requirements.map((req, index) => (
                              <li key={index} className={record.pending_requirements.includes(req) ? "pending" : "completed"}>
                                {req}
                                {record.pending_requirements.includes(req) ? " ⏳" : " ✅"}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {record.notes && (
                        <div className="notes">
                          <strong>Notes:</strong>
                          <p>{record.notes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-clearance">
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No Clearance Records</h3>
                  <p>Your clearance records will appear here once they are available.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="clearance-summary">
          <div className="summary-card">
            <h4>📊 Clearance Summary</h4>
            <div className="summary-stats">
              <div className="stat-item">
                <span className="stat-label">Total Departments:</span>
                <span className="stat-value">{clearanceRecords.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Cleared:</span>
                <span className="stat-value cleared">{clearanceRecords.filter(r => r.status === "cleared").length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Pending:</span>
                <span className="stat-value pending">{clearanceRecords.filter(r => r.status === "pending").length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Incomplete:</span>
                <span className="stat-value incomplete">{clearanceRecords.filter(r => r.status === "incomplete").length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === "clearance-request") {
    return (
      <div className="clearance-section">
        <div className="section-header">
          <h2>📝 Clearance Requests</h2>
          <p>Submit and track your clearance requests</p>
        </div>

        <div className="new-request-section">
          <div className="new-request-card">
            <h3>🆕 Submit New Clearance Request</h3>
            <div className="request-form">
              <div className="form-group">
                <label htmlFor="request-type">Request Type:</label>
                <select 
                  id="request-type"
                  value={newRequestType} 
                  onChange={(e) => setNewRequestType(e.target.value)}
                  disabled={isLoading}
                >
                  <option value="">Select request type</option>
                  <option value="academic">Academic Clearance</option>
                  <option value="financial">Financial Clearance</option>
                  <option value="library">Library Clearance</option>
                  <option value="hostel">Hostel Clearance</option>
                  <option value="general">General Clearance</option>
                  <option value="graduation">Graduation Clearance</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Reason/Purpose:</label>
                <textarea 
                  value={newRequestReason}
                  onChange={(e) => setNewRequestReason(e.target.value)}
                  placeholder="Describe the reason for your clearance request..."
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              
              <button 
                className="submit-request-btn"
                onClick={handleNewRequest}
                disabled={isLoading || !newRequestType || !newRequestReason}
              >
                {isLoading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>

        <div className="requests-history">
          <h3>📋 My Clearance Requests</h3>
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
                      <th>Requested Date</th>
                      <th>Processed Date</th>
                      <th>Approved By</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clearanceRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="request-type">{request.request_type}</td>
                        <td className="request-reason">{request.request_reason}</td>
                        <td>
                          <span className={`status ${request.status.toLowerCase()}`}>
                            {request.status}
                          </span>
                        </td>
                        <td>{new Date(request.requested_date).toLocaleDateString()}</td>
                        <td>
                          {request.processed_date ? 
                            new Date(request.processed_date).toLocaleDateString() : 
                            "-"
                          }
                        </td>
                        <td>{request.approved_by || "-"}</td>
                        <td>
                          <button className="btn-sm">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-requests">
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No Requests Yet</h3>
                    <p>You haven't submitted any clearance requests yet.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="clearance-info">
          <div className="info-card">
            <h4>📋 Important Information</h4>
            <ul>
              <li>Clearance requests are processed within 3-5 business days</li>
              <li>Ensure all required documents are submitted with your request</li>
              <li>You will be notified via email when your request is processed</li>
              <li>For urgent requests, contact the relevant department directly</li>
              <li>Academic clearances may require completion of all course requirements</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  return null
}
