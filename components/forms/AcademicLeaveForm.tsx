"use client"

import type React from "react"
import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"

/**
 * Allows an admin to place a student on academic leave
 * or restore them from leave.
 */
export function AcademicLeaveForm() {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [reason, setReason] = useState("")
  const [isPlacingOnLeave, setIsPlacingOnLeave] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registrationNumber.trim()) {
      showToast("Please enter a registration number", "error")
      return
    }

    setIsPlacingOnLeave(true)

    try {
      const result = await apiRequest(`/api/students/registration/${registrationNumber}/academic-leave`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      })

      if (result.success) {
        showToast("Student placed on academic leave successfully!", "success")
        setRegistrationNumber("")
        setReason("")
      } else {
        showToast(result.error || "Failed to place student on leave", "error")
      }
    } catch (error) {
      showToast("An error occurred while processing academic leave", "error")
    } finally {
      setIsPlacingOnLeave(false)
    }
  }

  return (
    <Card title="Academic Leave" description="Place a student on academic leave" icon="fas fa-user-clock">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="leaveStudentReg">
            <i className="fas fa-id-card"></i>Registration Number
          </label>
          <input
            type="text"
            id="leaveStudentReg"
            className="input-field"
            placeholder="Enter registration number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="leaveReason">
            <i className="fas fa-comment"></i>Reason (Optional)
          </label>
          <textarea
            id="leaveReason"
            className="input-field"
            placeholder="Enter reason for academic leave"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={isPlacingOnLeave}>
          <i className="fas fa-user-clock"></i>
          {isPlacingOnLeave ? (
            <>
              <div className="spinner"></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>Submit</span>
          )}
        </button>
      </form>
    </Card>
  )
}
