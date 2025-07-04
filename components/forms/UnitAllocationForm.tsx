"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"

interface Student {
  id: string
  name: string
  registration_number: string
  course: string
  level_of_study: string
}

interface Unit {
  id: string
  unit_name: string
  unit_code: string
}

export function UnitAllocationForm() {
  const [students, setStudents] = useState<Student[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const { showToast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoadingData(true)
      
      // Fetch students
      const studentsResult = await apiRequest("/api/students")
      if (studentsResult.success) {
        setStudents(studentsResult.data || [])
      }

      // Fetch units
      const unitsResult = await apiRequest("/api/units")
      if (unitsResult.success) {
        setUnits(unitsResult.data || [])
      }
    } catch (error) {
      showToast("Error loading data", "error")
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleUnitToggle = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStudent) {
      showToast("Please select a student", "error")
      return
    }

    if (selectedUnits.length === 0) {
      showToast("Please select at least one unit", "error")
      return
    }

    setIsLoading(true)

    try {
      const result = await apiRequest("/api/admin/allocate-units", {
        method: "POST",
        body: JSON.stringify({
          student_id: selectedStudent,
          unit_ids: selectedUnits
        })
      })

      if (result.success) {
        showToast("Units allocated successfully!", "success")
        setSelectedStudent("")
        setSelectedUnits([])
      } else {
        showToast(result.error || "Failed to allocate units", "error")
      }
    } catch (error) {
      showToast("An error occurred while allocating units", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const getSelectedStudent = () => {
    return students.find(s => s.id === selectedStudent)
  }

  if (isLoadingData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="spinner"></div>
            <span className="ml-2">Loading data...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <i className="fas fa-tasks"></i> Allocate Units to Students
        </CardTitle>
        <CardDescription>
          Assign academic units to students for registration
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          {/* Student Selection */}
          <div className="form-group">
            <label htmlFor="studentSelect">
              <i className="fas fa-user-graduate"></i>Select Student *
            </label>
            <select
              id="studentSelect"
              className="input-field"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              required
            >
              <option value="">Choose a student...</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.registration_number}) - {student.course}
                </option>
              ))}
            </select>
            {selectedStudent && getSelectedStudent() && (
              <small className="form-hint">
                <i className="fas fa-info-circle"></i>
                Course: {getSelectedStudent()?.course}, Level: {getSelectedStudent()?.level_of_study}
              </small>
            )}
          </div>

          {/* Unit Selection */}
          <div className="form-group">
            <label>
              <i className="fas fa-list-ul"></i>Select Units to Allocate *
            </label>
            <div className="units-grid">
              {units.map((unit) => (
                <div key={unit.id} className="unit-checkbox">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedUnits.includes(unit.id)}
                      onChange={() => handleUnitToggle(unit.id)}
                    />
                    <span className="checkmark"></span>
                    <div className="unit-info">
                      <strong>{unit.unit_code}</strong>
                      <div className="unit-name">{unit.unit_name}</div>
                    </div>
                  </label>
                </div>
              ))}
            </div>
            {selectedUnits.length > 0 && (
              <small className="form-hint">
                <i className="fas fa-check-circle"></i>
                {selectedUnits.length} unit(s) selected
              </small>
            )}
          </div>

          {/* Allocation Summary */}
          {selectedStudent && selectedUnits.length > 0 && (
            <div className="allocation-summary">
              <h4>
                <i className="fas fa-clipboard-check"></i>Allocation Summary
              </h4>
              <div className="summary-content">
                <p>
                  <strong>Student:</strong> {getSelectedStudent()?.name} ({getSelectedStudent()?.registration_number})
                </p>
                <p>
                  <strong>Units to allocate:</strong> {selectedUnits.length}
                </p>
                <ul className="selected-units-list">
                  {selectedUnits.map(unitId => {
                    const unit = units.find(u => u.id === unitId)
                    return unit ? (
                      <li key={unitId}>
                        {unit.unit_code} - {unit.unit_name}
                      </li>
                    ) : null
                  })}
                </ul>
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
            <i className="fas fa-paper-plane"></i>
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Allocating Units...</span>
              </>
            ) : (
              <span>Allocate Selected Units</span>
            )}
          </button>
        </form>
      </CardContent>
    </Card>
  )
}
