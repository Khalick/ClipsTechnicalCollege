"use client"

import React, { useState } from 'react';
import { FeeStatementModal } from './FeeStatementModal';
import { ExamCardModal } from './ExamCardModal';
import { useStudentAuth } from '@/hooks/useStudentAuth';

interface FeeData {
  fee_balance: number
  total_paid: number
  total_billed: number
  semester_fee: number
  current_semester_fee?: number
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

interface FeeInformationProps {
  fees: FeeData | null
  onRefresh?: () => void
}

export function FeeInformation({ fees, onRefresh }: FeeInformationProps) {
  const [showFeeStatement, setShowFeeStatement] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExamCardModalOpen, setIsExamCardModalOpen] = useState(false);
  const { user } = useStudentAuth();
  const feeData = fees;

  // Auto-refresh every 30 seconds if there's an outstanding balance
  React.useEffect(() => {
    if (feeData && feeData.fee_balance > 0 && onRefresh) {
      const interval = setInterval(() => {
        onRefresh()
      }, 30000) // Refresh every 30 seconds
      
      return () => clearInterval(interval)
    }
  }, [feeData, onRefresh])

  if (!feeData) {
    return (
      <div className="card">
        <h2>💰 Fee Information</h2>
        <div className="loading-message">
          <p>Loading fee information...</p>
        </div>
      </div>
    )
  }

  const getBalanceColor = () => {
    if (feeData.fee_balance <= 0) return 'bg-green-500'
    if (feeData.fee_balance <= 10000) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getPaymentProgress = () => {
    const totalBilled = feeData.semester_fee || feeData.total_billed || 0
    if (totalBilled <= 0) return 0
    return Math.round((feeData.total_paid / totalBilled) * 100)
  }

  const getProgressBarClass = () => {
    const progress = Math.min(getPaymentProgress(), 100)
    const rounded = Math.round(progress / 10) * 10
    return `progress-fill progress-fill-${rounded}`
  }

  return (
    <div className="card">
      <div className="fee-details">
        <div className="fee-header">
          <h2>💰 Fee Information</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="action-button"
            >
              🔄 Refresh
            </button>
          )}
        </div>
      </div>
      
      <div className="fees-dashboard">
        {/* Payment Progress Bar */}
        <div>
          <div className="fee-item">
            <span className="fee-label">Payment Progress</span>
            <span className="fee-value">{getPaymentProgress()}%</span>
          </div>
          <div className="progress-bar">
            <div className={getProgressBarClass()}></div>
          </div>
        </div>

        {/* Fee Cards */}
        <div className="fee-details">
          {/* Total Billed */}
          <div className="fee-item">
            <span className="fee-label">🏷️ TOTAL BILLED:</span>
            <span className="fee-value">KSh. {(feeData.semester_fee || feeData.total_billed || 0).toLocaleString()}.00</span>
          </div>

          {/* Total Paid */}
          <div className="fee-item">
            <span className="fee-label">💚 TOTAL PAID:</span>
            <span className="fee-value">KSh. {feeData.total_paid.toLocaleString()}.00</span>
          </div>

          {/* Balance */}
          <div className="fee-item">
            <span className="fee-label">💬 BALANCE:</span>
            <span className="fee-value">KSh. {feeData.fee_balance.toLocaleString()}.00</span>
          </div>
        </div>

        {/* Payment Status Alert */}
        {feeData.fee_balance <= 0 && (
          <div className="success-message">
            <span>✅</span>
            <span>Congratulations! Your fees are fully paid.</span>
          </div>
        )}

        {feeData.fee_balance > 0 && feeData.fee_balance <= 10000 && (
          <div className="info-message">
            <span>⚠️</span>
            <span>You have a small outstanding balance. Consider clearing it soon.</span>
          </div>
        )}

        {feeData.fee_balance > 10000 && (
          <div className="error-message">
            <span>🚨</span>
            <span>You have an outstanding balance. Please make a payment to avoid penalties.</span>
          </div>
        )}

        {/* Payment Actions */}
        <div className="fee-details">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="action-button"
          >
            📄 View Fee Statement
          </button>
          <button 
            onClick={() => setIsExamCardModalOpen(true)}
            className="action-button"
          >
            🎓 View Exam Card
          </button>
        </div>
      </div>

      {/* Fee Statement Modal */}
      {user && feeData && (
        <FeeStatementModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studentData={{
            name: user.name || 'Unknown',
            registration_number: user.registrationNumber || 'Unknown',
            course: user.course || 'Unknown',
            level_of_study: user.level_of_study || 'Unknown'
          }}
          feeData={feeData}
        />
      )}

      {/* Exam Card Modal */}
      <ExamCardModal
        isOpen={isExamCardModalOpen}
        onClose={() => setIsExamCardModalOpen(false)}
      />
    </div>
  )
}
