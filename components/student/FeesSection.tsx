"use client"

import { useState, useEffect } from 'react'

interface Fee {
  id: number
  semester: string
  total_billed: number
  total_paid: number
  due_date: string
  created_at: string
}

interface Payment {
  id: number
  amount: number
  payment_date: string
  payment_method: string
  reference_number: string
}

interface FeesSectionProps {
  registrationNumber: string
}

export function FeesSection({ registrationNumber }: FeesSectionProps) {
  const [fees, setFees] = useState<Fee[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await fetch(`/api/students/fees/${encodeURIComponent(registrationNumber)}`)
        const result = await response.json()
        
        if (result.success) {
          setFees(result.data.fees || [])
          setPayments(result.data.payments || [])
        }
      } catch (error) {
        console.error('Error fetching fees:', error)
      } finally {
        setLoading(false)
      }
    }

    if (registrationNumber) {
      fetchFees()
    }
  }, [registrationNumber])

  if (loading) return <div>Loading fees...</div>

  return (
    <div className="fees-section">
      <h3>Fee Information</h3>
      
      <div className="fees-summary">
        <h4>Outstanding Fees</h4>
        {fees.length === 0 ? (
          <p>No fees recorded</p>
        ) : (
          <table className="fees-table">
            <thead>
              <tr>
                <th>Semester</th>
                <th>Total Billed</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((fee) => (
                <tr key={fee.id}>
                  <td>{fee.semester}</td>
                  <td>KSh {fee.total_billed?.toLocaleString() || 0}</td>
                  <td>KSh {fee.total_paid?.toLocaleString() || 0}</td>
                  <td>KSh {((fee.total_billed || 0) - (fee.total_paid || 0)).toLocaleString()}</td>
                  <td>{fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="payments-history">
        <h4>Payment History</h4>
        {payments.length === 0 ? (
          <p>No payments recorded</p>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                  <td>KSh {payment.amount?.toLocaleString() || 0}</td>
                  <td>{payment.payment_method}</td>
                  <td>{payment.reference_number || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}