"use client"

import { useState, useEffect } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"

interface ProvisionalResult {
  id: string
  unit_name: string
  unit_code: string
  semester: string
  academic_year: string
  grade: string
  marks: number
  exam_date: string
}

interface LecturerEvaluation {
  id: string
  lecturer_name: string
  unit_name: string
  unit_code: string
  semester: string
  academic_year: string
  evaluation_status: string
  evaluation_period_start: string
  evaluation_period_end: string
}

interface AcademicRequisition {
  id: string
  requisition_type: string
  document_type: string
  status: string
  requested_date: string
  processed_date?: string
  fee_amount: number
  payment_status: string
  collection_date?: string
  notes?: string
}

interface AcademicsSectionProps {
  activeSection: string
  units: any[]
  onUnitsChange: (units: any[]) => void
  studentData: any
  user: any
}

export function AcademicsSection({ 
  activeSection, 
  units, 
  onUnitsChange, 
  studentData, 
  user 
}: AcademicsSectionProps) {
  const [provisionalResults, setProvisionalResults] = useState<ProvisionalResult[]>([])
  const [lecturerEvaluations, setLecturerEvaluations] = useState<LecturerEvaluation[]>([])
  const [academicRequisitions, setAcademicRequisitions] = useState<AcademicRequisition[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState("all")
  const [selectedYear, setSelectedYear] = useState("all")
  const { showToast } = useToast()

  // Fetch provisional results
  const fetchProvisionalResults = async () => {
    try {
      setIsLoading(true)
      const regNumber = studentData?.registration_number || user?.registrationNumber
      
      const response = await fetch(`/api/students/provisional-results?registrationNumber=${regNumber}`)
      const data = await response.json()
      
      if (data.success) {
        setProvisionalResults(data.data)
      } else {
        showToast(data.message || "Failed to fetch results", "error")
      }
    } catch (error) {
      showToast("Error fetching provisional results", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch lecturer evaluations
  const fetchLecturerEvaluations = async () => {
    try {
      setIsLoading(true)
      const regNumber = studentData?.registration_number || user?.registrationNumber
      
      const response = await fetch(`/api/students/lecturer-evaluation?registrationNumber=${regNumber}`)
      const data = await response.json()
      
      if (data.success) {
        setLecturerEvaluations(data.data)
      } else {
        showToast(data.message || "Failed to fetch evaluations", "error")
      }
    } catch (error) {
      showToast("Error fetching lecturer evaluations", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch academic requisitions
  const fetchAcademicRequisitions = async () => {
    try {
      setIsLoading(true)
      const regNumber = studentData?.registration_number || user?.registrationNumber
      
      const response = await fetch(`/api/students/academic-requisitions?registrationNumber=${regNumber}`)
      const data = await response.json()
      
      if (data.success) {
        setAcademicRequisitions(data.data)
      } else {
        showToast(data.message || "Failed to fetch requisitions", "error")
      }
    } catch (error) {
      showToast("Error fetching academic requisitions", "error")
    } finally {
      setIsLoading(false)
    }
  }

  // Load data based on active section
  useEffect(() => {
    if (activeSection === "provisional-results") {
      fetchProvisionalResults()
    } else if (activeSection === "lecturer-evaluation") {
      fetchLecturerEvaluations()
    } else if (activeSection === "academic-requisitions") {
      fetchAcademicRequisitions()
    }
  }, [activeSection, studentData, user])

  // Filter results based on selected semester and year
  const filteredResults = provisionalResults.filter(result => {
    const semesterMatch = selectedSemester === "all" || result.semester === selectedSemester
    const yearMatch = selectedYear === "all" || result.academic_year === selectedYear
    return semesterMatch && yearMatch
  })

  // Get unique semesters and years for filters
  const uniqueSemesters = [...new Set(provisionalResults.map(r => r.semester))]
  const uniqueYears = [...new Set(provisionalResults.map(r => r.academic_year))]

  // Handle new requisition request
  const handleNewRequisition = async (requisitionType: string, documentType: string) => {
    try {
      setIsLoading(true)
      const regNumber = studentData?.registration_number || user?.registrationNumber
      
      const response = await fetch('/api/students/academic-requisitions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: regNumber,
          requisitionType,
          documentType,
        }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        showToast("Requisition submitted successfully", "success")
        fetchAcademicRequisitions() // Refresh the list
      } else {
        showToast(data.message || "Failed to submit requisition", "error")
      }
    } catch (error) {
      showToast("Error submitting requisition", "error")
    } finally {
      setIsLoading(false)
    }
  }

  if (activeSection === "provisional-results") {
    return (
      <div className="academics-section">
        <div className="section-header">
          <h2>📊 Provisional Results</h2>
          <p>View your academic performance and provisional results</p>
        </div>

        <div className="results-filters">
          <div className="filter-group">
            <label>Academic Year:</label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} aria-label="Select academic year">
              <option value="all">All Years</option>
              {uniqueYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label>Semester:</label>
            <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} aria-label="Select semester">
              <option value="all">All Semesters</option>
              {uniqueSemesters.map(semester => (
                <option key={semester} value={semester}>{semester}</option>
              ))}
            </select>
          </div>
          <button className="refresh-btn" onClick={fetchProvisionalResults}>
            🔄 Refresh Results
          </button>
        </div>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading results...</p>
          </div>
        ) : (
          <div className="results-container">
            {filteredResults.length > 0 ? (
              <div className="results-table">
                <table>
                  <thead>
                    <tr>
                      <th>Unit Code</th>
                      <th>Unit Name</th>
                      <th>Semester</th>
                      <th>Academic Year</th>
                      <th>Marks</th>
                      <th>Grade</th>
                      <th>Exam Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResults.map((result) => (
                      <tr key={result.id}>
                        <td className="unit-code">{result.unit_code}</td>
                        <td className="unit-name">{result.unit_name}</td>
                        <td>{result.semester}</td>
                        <td>{result.academic_year}</td>
                        <td className="marks">{result.marks}</td>
                        <td className={`grade grade-${result.grade.toLowerCase()}`}>
                          {result.grade}
                        </td>
                        <td>{new Date(result.exam_date).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-results">
                <div className="empty-state">
                  <div className="empty-icon">📄</div>
                  <h3>No Results Available</h3>
                  <p>Your provisional results will appear here once they are published.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="results-actions">
          <button className="btn-secondary" onClick={() => window.print()}>
            📄 Print Results
          </button>
          <button className="btn-primary" onClick={fetchProvisionalResults}>
            📥 Download PDF
          </button>
        </div>
      </div>
    )
  }

  if (activeSection === "lecturer-evaluation") {
    return (
      <div className="academics-section">
        <div className="section-header">
          <h2>👨‍🏫 Lecturer Evaluation</h2>
          <p>Evaluate your lecturers and help improve teaching quality</p>
        </div>

        {isLoading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading evaluations...</p>
          </div>
        ) : (
          <div className="evaluations-container">
            {lecturerEvaluations.length > 0 ? (
              <div className="evaluations-grid">
                {lecturerEvaluations.map((evaluation) => (
                  <div key={evaluation.id} className="evaluation-card">
                    <div className="evaluation-header">
                      <h4>{evaluation.lecturer_name}</h4>
                      <span className={`status ${evaluation.evaluation_status.toLowerCase()}`}>
                        {evaluation.evaluation_status}
                      </span>
                    </div>
                    <div className="evaluation-details">
                      <p><strong>Unit:</strong> {evaluation.unit_code} - {evaluation.unit_name}</p>
                      <p><strong>Semester:</strong> {evaluation.semester} {evaluation.academic_year}</p>
                      <p><strong>Period:</strong> {new Date(evaluation.evaluation_period_start).toLocaleDateString()} - {new Date(evaluation.evaluation_period_end).toLocaleDateString()}</p>
                    </div>
                    <div className="evaluation-actions">
                      {evaluation.evaluation_status === "pending" ? (
                        <button className="btn-primary">
                          ✍️ Start Evaluation
                        </button>
                      ) : (
                        <button className="btn-secondary" disabled>
                          ✅ Completed
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-evaluations">
                <div className="empty-state">
                  <div className="empty-icon">👨‍🏫</div>
                  <h3>No Evaluations Available</h3>
                  <p>Lecturer evaluations will be available during the evaluation period.</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="evaluation-info">
          <div className="info-card">
            <h4>📋 Evaluation Guidelines</h4>
            <ul>
              <li>Evaluations are anonymous and confidential</li>
              <li>Please provide honest and constructive feedback</li>
              <li>Your feedback helps improve teaching quality</li>
              <li>Evaluations must be completed within the specified period</li>
            </ul>
          </div>
        </div>
      </div>
    )
  }

  if (activeSection === "academic-requisitions") {
    return (
      <div className="academics-section">
        <div className="section-header">
          <h2>📋 Academic Requisitions</h2>
          <p>Request academic documents and track your applications</p>
        </div>

        <div className="requisitions-actions">
          <div className="new-requisition">
            <h3>📄 Request New Document</h3>
            <div className="requisition-types">
              <button 
                className="requisition-btn transcript"
                onClick={() => handleNewRequisition("document", "transcript")}
                disabled={isLoading}
              >
                <div className="btn-icon">📜</div>
                <div className="btn-content">
                  <h4>Official Transcript</h4>
                  <p>Certified academic transcript</p>
                </div>
              </button>
              <button 
                className="requisition-btn certificate"
                onClick={() => handleNewRequisition("document", "certificate")}
                disabled={isLoading}
              >
                <div className="btn-icon">🎓</div>
                <div className="btn-content">
                  <h4>Certificate</h4>
                  <p>Academic certificate</p>
                </div>
              </button>
              <button 
                className="requisition-btn letter"
                onClick={() => handleNewRequisition("document", "letter")}
                disabled={isLoading}
              >
                <div className="btn-icon">📝</div>
                <div className="btn-content">
                  <h4>Student Letter</h4>
                  <p>Official student letter</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="requisitions-history">
          <h3>📋 My Requisitions</h3>
          {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading requisitions...</p>
            </div>
          ) : (
            <div className="requisitions-table">
              {academicRequisitions.length > 0 ? (
                <table>
                  <thead>
                    <tr>
                      <th>Document Type</th>
                      <th>Status</th>
                      <th>Requested Date</th>
                      <th>Fee Amount</th>
                      <th>Payment Status</th>
                      <th>Collection Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicRequisitions.map((requisition) => (
                      <tr key={requisition.id}>
                        <td className="document-type">{requisition.document_type}</td>
                        <td>
                          <span className={`status ${requisition.status.toLowerCase()}`}>
                            {requisition.status}
                          </span>
                        </td>
                        <td>{new Date(requisition.requested_date).toLocaleDateString()}</td>
                        <td className="fee-amount">KSh {requisition.fee_amount.toLocaleString()}</td>
                        <td>
                          <span className={`payment-status ${requisition.payment_status.toLowerCase()}`}>
                            {requisition.payment_status}
                          </span>
                        </td>
                        <td>
                          {requisition.collection_date ? 
                            new Date(requisition.collection_date).toLocaleDateString() : 
                            "-"
                          }
                        </td>
                        <td>
                          <button className="btn-sm">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="no-requisitions">
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No Requisitions Yet</h3>
                    <p>You haven't requested any academic documents yet.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  return null
}
