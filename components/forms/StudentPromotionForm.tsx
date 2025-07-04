"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"

/**
 * Promote a student to a new level of study
 * (e.g., Year 3 Semester 1 → Year 3 Semester 2).
 */
export function StudentPromotionForm() {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [newLevel, setNewLevel] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registrationNumber.trim() || !newLevel.trim()) {
      showToast("Enter both registration number and new level", "error")
      return
    }

    setIsLoading(true)

    try {
      const result = await apiRequest("/api/students/promote", {
        method: "POST",
        body: JSON.stringify({
          registration_number: registrationNumber.trim(),
          new_level: newLevel.trim(),
        }),
      })

      if (result.success) {
        showToast("Student promoted successfully!", "success")
        setRegistrationNumber("")
        setNewLevel("")
      } else {
        showToast(result.error || "Failed to promote student", "error")
      }
    } catch (error) {
      showToast("An error occurred while promoting student", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card title="Promote Student" description="Change a student's level of study" icon="fas fa-level-up-alt">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="promoStudentReg">
            <i className="fas fa-id-card"></i>Registration Number
          </label>
          <input
            type="text"
            id="promoStudentReg"
            className="input-field"
            placeholder="Enter registration number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="promoNewLevel">
            <i className="fas fa-signal"></i>New Level&nbsp;(e.g.&nbsp;Y3&nbsp;Sem&nbsp;2)
          </label>
          <input
            type="text"
            id="promoNewLevel"
            className="input-field"
            placeholder="Enter new level of study"
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
          <i className="fas fa-level-up-alt"></i>
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>Promote Student</span>
          )}
        </button>
      </form>
    </Card>
  )
}
