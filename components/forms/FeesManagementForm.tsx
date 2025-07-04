"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"

/**
 * Record a fee payment or update a student's fee balance.
 * This is a minimal placeholder you can expand later.
 */
export function FeesManagementForm() {
  const [registrationNumber, setRegistrationNumber] = useState("")
  const [amount, setAmount] = useState<number | "">("")
  const [isLoading, setIsLoading] = useState(false)
  const { showToast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!registrationNumber.trim() || amount === "") {
      showToast("Enter both registration number and amount", "error")
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/finance/record-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registration_number: registrationNumber.trim(),
          amount: Number(amount),
          payment_method: "cash",
          notes: "Payment recorded via admin panel"
        }),
      })

      const result = await response.json()

      if (result.success) {
        showToast("Payment recorded successfully!", "success")
        setRegistrationNumber("")
        setAmount("")
      } else {
        showToast(result.error || "Failed to record payment", "error")
      }
    } catch (error) {
      console.error('Error recording payment:', error)
      showToast("An error occurred while recording payment", "error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="admin-form-card">
      <div className="form-header">
        <h2><i className="fas fa-money-bill-wave"></i> Fee Payment Management</h2>
        <p className="form-description">Record student fee payments and update account balances in the system</p>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="feesStudentReg">
            <i className="fas fa-id-card"></i>Registration Number
          </label>
          <input
            id="feesStudentReg"
            type="text"
            className="input-field"
            placeholder="Enter registration number"
            value={registrationNumber}
            onChange={(e) => setRegistrationNumber(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="paymentAmount">
            <i className="fas fa-coins"></i>Amount (KSH)
          </label>
          <input
            id="paymentAmount"
            type="number"
            className="input-field"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            required
            min={0}
          />
        </div>

        <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
          <i className="fas fa-save"></i>
          {isLoading ? (
            <>
              <div className="spinner"></div>
              <span>Saving...</span>
            </>
          ) : (
            <span>Record Payment</span>
          )}
        </button>
      </form>
    </div>
  )
}
