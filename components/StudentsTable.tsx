"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"
import type { Student } from "@/types/student"
import { EditStudentModal } from "./EditStudentModal"

/**
 * Displays a simple list of students.
 * You can enhance this later with pagination, search, etc.
 */
export function StudentsTable() {
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const { showToast } = useToast()

  useEffect(() => {
    const fetchStudents = async () => {
      setIsLoading(true)
      const result = await apiRequest<Student[]>("/api/students")
      if (result.success && result.data) {
        setStudents(result.data)
      } else {
        showToast(result.error || "Failed to fetch students", "error")
      }
      setIsLoading(false)
    }

    fetchStudents()
  }, [showToast])

  if (isLoading) {
    return (
      <div className="card" style={{ textAlign: "center" }}>
        Loading students...
      </div>
    )
  }

  return (
    <div className="card">
      <h2>Students</h2>
      {students.length === 0 ? (
        <p>No students found.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="students-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>#</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Reg&nbsp;Number</th>
                <th style={thStyle}>Course</th>
                <th style={thStyle}>Level</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={tdStyle}>{idx + 1}</td>
                  <td style={tdStyle}>{s.name}</td>
                  <td style={tdStyle}>{s.registration_number}</td>
                  <td style={tdStyle}>{s.course}</td>
                  <td style={tdStyle}>{s.level_of_study}</td>
                  <td style={tdStyle}>{s.status}</td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => setEditingStudent(s)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "12px"
                      }}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          isOpen={!!editingStudent}
          onClose={() => setEditingStudent(null)}
          onUpdate={(updatedStudent) => {
            setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s))
          }}
        />
      )}
    </div>
  )
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  padding: "8px",
  background: "#f8f9fa",
  fontWeight: 600,
}

const tdStyle: React.CSSProperties = {
  padding: "8px",
}
