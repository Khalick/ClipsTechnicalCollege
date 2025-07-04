"use client"

import type React from "react"

import { useState } from "react"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"
import { Card } from "@/components/ui/card"

export function StudentDeregistrationForm() {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [reason, setReason] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registrationNumber.trim()) {
      showToast("Please enter a registration number", "error")
      return
    }

    setIsLoading(true)

    try {
      const result = await apiRequest(`/api/students/registration/${registrationNumber}/deregister`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      })

      if (result.success) {
        showToast("Student deregistered successfully!", "success")
        setRegistrationNumber("")
        setReason("")
      } else {
        showToast(result.error || "Failed to deregister student", "error")
      }
    } catch (error) {
      showToast("An error occurred while deregistering student", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card title="Deregister Student" description="Remove a student from the system" icon="fas fa-user-minus">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="deregStudentReg">
            <i className="fas fa-id-card"></i>Registration Number
          </label>
          <input
            type="text"
            id="deregStudentReg"
            className="input-field"
            placeholder="Enter registration number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="deregReason">
            <i className="fas fa-comment"></i>Reason (Optional)
          </label>
          <textarea
            id="deregReason"
            className="input-field"
            placeholder="Enter reason for deregistration"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
          <i className="fas fa-user-times"></i>
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <span>Processing...</span>
            </>
          ) : (
            <span>Deregister Student</span>
          )}
        </button>
      </form>
    </Card>
  )
}
