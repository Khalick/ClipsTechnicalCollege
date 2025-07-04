"use client"

import { useState, useEffect } from "react"
import { useToast } from "@/hooks/useToast"
import { useStudentAuth } from "@/hooks/useStudentAuth"

interface Unit {
  id: string
  name: string
  code: string
  status: string
  credits?: number
  description?: string
  allocation_id?: string
  allocated_at?: string
}

interface UnitRegistrationProps {
  units: Unit[]
  onUnitsChange: (units: Unit[]) => void
}

export function UnitRegistration({ units, onUnitsChange }: UnitRegistrationProps) {
  const [allocatedUnits, setAllocatedUnits] = useState<Unit[]>([])
  const [selectedUnits, setSelectedUnits] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingAllocated, setIsLoadingAllocated] = useState(true)
  const { user } = useStudentAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (user?.id) {
      fetchAllocatedUnits()
    }
  }, [user])

  const fetchAllocatedUnits = async () => {
    try {
      setIsLoadingAllocated(true)
      const response = await fetch(`/api/students/allocated-units?student_id=${user?.id}`)
      const data = await response.json()

      if (response.ok) {
        const formattedUnits = data.allocated_units.map((unit: any) => ({
          id: unit.unit_id,
          name: unit.unit_name,
          code: unit.unit_code,
          status: "allocated",
          credits: unit.credits,
          description: unit.description,
          allocation_id: unit.allocation_id,
          allocated_at: unit.allocated_at
        }))
        setAllocatedUnits(formattedUnits)
      } else {
        showToast("Error loading allocated units", "error")
      }
    } catch (error) {
      showToast("Error loading allocated units", "error")
    } finally {
      setIsLoadingAllocated(false)
    }
  }

  const handleUnitToggle = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    )
  }

  const registerSelectedUnits = async () => {
    if (selectedUnits.length === 0) {
      showToast("Please select units to register", "error")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/students/register-units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user?.id,
          unit_ids: selectedUnits
        })
      })

      const data = await response.json()

      if (response.ok) {
        const newRegisteredUnits = data.registered_units.map((unit: any) => ({
          id: unit.unit_id.toString(),
          name: unit.unit_name,
          code: unit.unit_code,
          status: "registered",
          credits: unit.credits
        }))

        onUnitsChange([...units, ...newRegisteredUnits])
        setSelectedUnits([])
        showToast(`Successfully registered for ${data.registered_units.length} unit(s)`, "success")
        
        // Refresh allocated units to reflect changes
        fetchAllocatedUnits()
      } else {
        showToast(data.message || data.error || "Registration failed", "error")
      }
    } catch (error) {
      showToast("Error registering for units", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const dropUnit = async (unitId: string) => {
    try {
      const unit = units.find((u) => u.id === unitId)
      if (!unit) return

      if (confirm(`Are you sure you want to drop ${unit.name}?`)) {
        onUnitsChange(units.filter((u) => u.id !== unitId))
        showToast(`Successfully dropped ${unit.name}`, "success")
      }
    } catch (error) {
      showToast("Error dropping unit", "error")
    }
  }

  // Filter allocated units to show only those not already registered
  const availableForRegistration = allocatedUnits.filter(
    allocatedUnit => !units.some(registeredUnit => registeredUnit.id === allocatedUnit.id)
  )

  return (
    <>
      <div className="card" id="units-registered">
        <h2>
          <i className="fas fa-graduation-cap"></i> Current Registered Units
        </h2>
        <ul className="unit-list">
          <li className="unit-list-header">
            <strong>Unit Name</strong>
            <strong>Unit Code</strong>
            <strong>Credits</strong>
            <strong>Status</strong>
            <strong>Action</strong>
          </li>
          {units.map((unit) => (
            <li key={unit.id} className="unit-list-item">
              <span className="unit-name">{unit.name}</span>
              <span className="unit-code">{unit.code}</span>
              <span className="unit-credits">{unit.credits || "3"}</span>
              <span className={`status-${unit.status}`}>{unit.status}</span>
              <button 
                onClick={() => dropUnit(unit.id)} 
                className="drop-unit-btn"
                title="Drop unit"
              >
                <i className="fas fa-times"></i> Drop
              </button>
            </li>
          ))}
          {units.length === 0 && (
            <li className="no-units">
              <span>No units registered yet</span>
            </li>
          )}
        </ul>
      </div>

      <div className="card" id="units-available">
        <h2>
          <i className="fas fa-list-check"></i> Available Units for Registration
        </h2>
        
        {isLoadingAllocated ? (
          <div className="loading-section">
            <div className="spinner"></div>
            <span>Loading allocated units...</span>
          </div>
        ) : (
          <>
            {availableForRegistration.length > 0 ? (
              <>
                <div className="allocation-info">
                  <p>
                    <i className="fas fa-info-circle"></i>
                    You can only register for units that have been allocated to you by the administration.
                  </p>
                </div>

                <div className="unit-selection-form">
                  <h3>Select Units to Register:</h3>
                  <div className="units-grid">
                    {availableForRegistration.map((unit) => (
                      <div key={unit.id} className="unit-card">
                        <label className="unit-checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedUnits.includes(unit.id)}
                            onChange={() => handleUnitToggle(unit.id)}
                          />
                          <div className="unit-details">
                            <div className="unit-header">
                              <strong className="unit-code">{unit.code}</strong>
                              <span className="unit-credits">{unit.credits || 3} credits</span>
                            </div>
                            <div className="unit-name">{unit.name}</div>
                            {unit.description && (
                              <div className="unit-description">{unit.description}</div>
                            )}
                            <div className="allocation-info-small">
                              <i className="fas fa-calendar-alt"></i>
                              Allocated: {new Date(unit.allocated_at || "").toLocaleDateString()}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>

                  {selectedUnits.length > 0 && (
                    <div className="selection-summary">
                      <p>
                        <i className="fas fa-check-circle"></i>
                        {selectedUnits.length} unit(s) selected
                      </p>
                    </div>
                  )}

                  <button
                    className="register-btn"
                    onClick={registerSelectedUnits}
                    disabled={selectedUnits.length === 0 || isLoading}
                  >
                    <i className="fas fa-plus-circle"></i>
                    {isLoading ? (
                      <>
                        <div className="spinner"></div>
                        <span>Registering...</span>
                      </>
                    ) : (
                      <span>Register Selected Units</span>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="no-units-available">
                <div className="empty-state">
                  <i className="fas fa-exclamation-triangle"></i>
                  <h3>No Units Available</h3>
                  <p>
                    There are currently no units allocated to you for registration.
                    Please contact the administration if you believe this is an error.
                  </p>
                  <button 
                    onClick={fetchAllocatedUnits}
                    className="refresh-btn"
                  >
                    <i className="fas fa-refresh"></i> Refresh
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </>
  )
}
