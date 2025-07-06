"use client"

import React from 'react'
import { X } from 'lucide-react'

interface FeeStatementModalProps {
  isOpen: boolean
  onClose: () => void
  studentData: {
    name: string
    registration_number: string
    course: string
    level_of_study: string
  }
  feeData: {
    fee_balance: number
    total_paid: number
    semester_fee: number
    session_progress: number
    fees: Array<{
      id: string
      semester: string
      total_fee: number
      amount_paid: number
      balance: number
      due_date: string
      created_at: string
    }>
    payments: Array<{
      id: string
      amount: number
      payment_date: string
      payment_method: string
      reference_number: string
      notes: string
    }>
  }
}

export function FeeStatementModal({ isOpen, onClose, studentData, feeData }: FeeStatementModalProps) {
  if (!isOpen) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return `KSh. ${amount.toLocaleString()}.00`
  }

  const handlePrint = async () => {
    try {
      const response = await fetch('/api/generate-pdf/fee-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentData, feeData }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `fee-statement-${studentData.registration_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF')
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Fee Statement</h2>
          <div className="modal-header-actions">
            <button
              onClick={handlePrint}
              className="print-btn"
              title="Download Statement"
            >
              Download
            </button>
            <button
              onClick={onClose}
              className="close-btn"
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Statement Content */}
        <div className="modal-content print:min-h-screen print:max-h-screen print:overflow-hidden">
          {/* Institution Header */}
          <div className="statement-header" style={{ textAlign: 'center', borderBottom: '2px solid #1f2937', paddingBottom: '1rem', marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '0.5rem' }}>CLIPS TECHNICAL COLLEGE</h1>
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1f2937', marginBottom: '0.5rem' }}>FEE STATEMENT</p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>Generated on: {formatDate(new Date().toISOString())}</p>
          </div>

          {/* Student Information & Summary in single row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            {/* Student Information */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>STUDENT INFORMATION</h3>
              <table style={{ width: '100%', fontSize: '0.75rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.25rem 0', fontWeight: '600', color: '#374151' }}>Name:</td>
                    <td style={{ padding: '0.25rem 0', color: '#1f2937' }}>{studentData.name}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.25rem 0', fontWeight: '600', color: '#374151' }}>Registration Number:</td>
                    <td style={{ padding: '0.25rem 0', color: '#1f2937' }}>{studentData.registration_number}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.25rem 0', fontWeight: '600', color: '#374151' }}>Course:</td>
                    <td style={{ padding: '0.25rem 0', color: '#1f2937' }}>{studentData.course}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.25rem 0', fontWeight: '600', color: '#374151' }}>Level:</td>
                    <td style={{ padding: '0.25rem 0', color: '#1f2937' }}>{studentData.level_of_study}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Fee Summary */}
            <div>
              <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>FEE SUMMARY</h3>
              <table style={{ width: '100%', fontSize: '0.75rem' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.25rem 0', fontWeight: '600', color: '#374151' }}>Total Billed:</td>
                    <td style={{ padding: '0.25rem 0', color: '#1f2937', fontWeight: '600' }}>{formatCurrency(feeData.semester_fee)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.25rem 0', fontWeight: '600', color: '#374151' }}>Total Paid:</td>
                    <td style={{ padding: '0.25rem 0', color: '#059669', fontWeight: '600' }}>{formatCurrency(feeData.total_paid)}</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.25rem 0', fontWeight: '600', color: '#374151' }}>Outstanding Balance:</td>
                    <td style={{ padding: '0.25rem 0', color: feeData.fee_balance > 0 ? '#dc2626' : '#059669', fontWeight: 'bold' }}>
                      {formatCurrency(feeData.fee_balance)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.25rem 0', fontWeight: '600', color: '#374151' }}>Payment Progress:</td>
                    <td style={{ padding: '0.25rem 0', color: '#2563eb', fontWeight: '600' }}>{feeData.session_progress}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Fee Details by Semester */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>FEE BREAKDOWN BY SEMESTER</h3>
            <table style={{ width: '100%', border: '1px solid #d1d5db', fontSize: '0.75rem' }}>
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '0.5rem', textAlign: 'left', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Semester</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Total Fee</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Amount Paid</th>
                  <th style={{ padding: '0.5rem', textAlign: 'right', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Balance</th>
                  <th style={{ padding: '0.5rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {feeData.fees.length > 0 ? feeData.fees.map((fee) => (
                  <tr key={fee.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.5rem', fontWeight: '500' }}>{fee.semester}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right' }}>{formatCurrency(fee.total_fee)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: '#059669' }}>{formatCurrency(fee.amount_paid)}</td>
                    <td style={{ padding: '0.5rem', textAlign: 'right', color: fee.balance > 0 ? '#dc2626' : '#059669', fontWeight: '600' }}>
                      {formatCurrency(fee.balance)}
                    </td>
                    <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '0.125rem 0.5rem', 
                        borderRadius: '0.25rem', 
                        fontSize: '0.625rem', 
                        fontWeight: '600',
                        backgroundColor: fee.balance <= 0 ? '#dcfce7' : '#fee2e2',
                        color: fee.balance <= 0 ? '#166534' : '#991b1b'
                      }}>
                        {fee.balance <= 0 ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: '#6b7280' }}>No fee records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Payment History */}
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.25rem' }}>PAYMENT HISTORY</h3>
            <p style={{ fontSize: '0.625rem', color: '#6b7280', marginBottom: '0.5rem' }}>All payments recorded by administration staff</p>
            <table style={{ width: '100%', border: '1px solid #d1d5db', fontSize: '0.625rem' }}>
              <thead style={{ backgroundColor: '#f3f4f6' }}>
                <tr>
                  <th style={{ padding: '0.25rem', textAlign: 'left', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Date</th>
                  <th style={{ padding: '0.25rem', textAlign: 'right', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Amount</th>
                  <th style={{ padding: '0.25rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Method</th>
                  <th style={{ padding: '0.25rem', textAlign: 'center', fontWeight: 'bold', color: '#1f2937', borderBottom: '1px solid #d1d5db' }}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {feeData.payments.length > 0 ? feeData.payments.map((payment) => (
                  <tr key={payment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '0.25rem' }}>
                      {formatDate(payment.payment_date)}
                    </td>
                    <td style={{ padding: '0.25rem', textAlign: 'right', color: '#059669', fontWeight: '600' }}>
                      {formatCurrency(payment.amount)}
                    </td>
                    <td style={{ padding: '0.25rem', textAlign: 'center' }}>
                      {payment.payment_method || 'Cash'}
                    </td>
                    <td style={{ padding: '0.25rem', textAlign: 'center' }}>
                      {payment.reference_number || 'N/A'}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'center', color: '#6b7280' }}>No payment records found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ borderTop: '2px solid #1f2937', paddingTop: '0.5rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.625rem', color: '#6b7280' }}>
              This fee statement is valid only for the current academic session. For inquiries, contact finance@clipstech.edu | +254 700 123 456
            </p>
            <p style={{ fontSize: '0.625rem', color: '#6b7280', marginTop: '0.25rem' }}>
              Generated on: {formatDate(new Date().toISOString())} | Authorized by: Finance Department
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
