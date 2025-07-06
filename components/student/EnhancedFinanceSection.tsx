"use client"

import React, { useState, useEffect } from "react"
import { useStudentAuth } from "@/hooks/useStudentAuth"
import { useToast } from "@/hooks/useToast"
import { FeeStatementModal } from "./FeeStatementModal"
import { ExamCardGenerator } from "./ExamCardGenerator"

interface FeeData {
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

interface StudentData {
  id: string
  name: string
  registration_number: string
  course: string
  level_of_study: string
  status: string
  email?: string
}

interface FinanceSectionProps {
  fees: FeeData | null
  studentData: StudentData | null
  onRefresh: () => void
}

const EnhancedFinanceSection: React.FC<FinanceSectionProps> = ({ fees, studentData, onRefresh }) => {
  const [activeTab, setActiveTab] = useState("overview")
  const [isStatementModalOpen, setIsStatementModalOpen] = useState(false)
  const [isExamCardModalOpen, setIsExamCardModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useStudentAuth()
  const { showToast } = useToast()

  // Auto-refresh every 30 seconds if there's an outstanding balance
  useEffect(() => {
    if (fees && fees.fee_balance > 0 && onRefresh) {
      const interval = setInterval(() => {
        onRefresh()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [fees, onRefresh])

  const getBalanceColor = () => {
    if (!fees) return "bg-gray-500"
    if (fees.fee_balance <= 0) return "bg-green-500"
    if (fees.fee_balance <= 10000) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getPaymentProgress = () => {
    if (!fees || fees.semester_fee <= 0) return 0
    return Math.round((fees.total_paid / fees.semester_fee) * 100)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const handleMakePayment = () => {
    showToast("Payment gateway integration coming soon", "info")
  }

  const handleDownloadReceipt = (paymentId: string) => {
    showToast("Receipt download feature coming soon", "info")
  }

  if (!fees) {
    return (
      <div className="finance-section">
        <div className="finance-header">
          <h2>Finance</h2>
          <p>Loading financial information...</p>
        </div>
        <div className="finance-loading">
          <div className="spinner"></div>
          <p>Please wait while we load your financial information...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="finance-section">
      <div className="finance-header">
        <h2>Finance</h2>
        <p>Manage your fees, payments, and financial information</p>
      </div>

      <div className="finance-layout">
        {/* Sidebar Navigation */}
        <div className="finance-sidebar">
          <h3>Finance Navigation</h3>
          <nav className="finance-nav">
            <ul>
              <li>
                <button
                  className={`finance-nav-item ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <span className="nav-icon">💰</span>
                  <span>Fee Overview</span>
                </button>
              </li>
              <li>
                <button
                  className={`finance-nav-item ${activeTab === "payments" ? "active" : ""}`}
                  onClick={() => setActiveTab("payments")}
                >
                  <span className="nav-icon">💳</span>
                  <span>Payment History</span>
                </button>
              </li>
              <li>
                <button
                  className={`finance-nav-item ${activeTab === "statements" ? "active" : ""}`}
                  onClick={() => setActiveTab("statements")}
                >
                  <span className="nav-icon">📄</span>
                  <span>Fee Statements</span>
                </button>
              </li>
              <li>
                <button
                  className={`finance-nav-item ${activeTab === "semester-fees" ? "active" : ""}`}
                  onClick={() => setActiveTab("semester-fees")}
                >
                  <span className="nav-icon">🗓️</span>
                  <span>Semester Fees</span>
                </button>
              </li>
              <li>
                <button
                  className={`finance-nav-item ${activeTab === "make-payment" ? "active" : ""}`}
                  onClick={() => setActiveTab("make-payment")}
                >
                  <span className="nav-icon">💸</span>
                  <span>Make Payment</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="finance-content">
          {activeTab === "overview" && (
            <div className="finance-tab">
              <div className="tab-header">
                <h3>Fee Overview</h3>
                <p>Your current financial status and fee breakdown</p>
              </div>

              {/* Fee Cards */}
              <div className="fee-cards-grid">
                <div className="fee-card fee-card-billed">
                  <div className="fee-card-icon">🏷️</div>
                  <div className="fee-card-content">
                    <div className="fee-card-label">TOTAL BILLED</div>
                    <div className="fee-card-amount">{formatCurrency(fees.semester_fee)}</div>
                    <div className="fee-card-description">Current semester fees</div>
                  </div>
                </div>

                <div className="fee-card fee-card-paid">
                  <div className="fee-card-icon">💚</div>
                  <div className="fee-card-content">
                    <div className="fee-card-label">TOTAL PAID</div>
                    <div className="fee-card-amount">{formatCurrency(fees.total_paid)}</div>
                    <div className="fee-card-description">Amount paid to date</div>
                  </div>
                </div>

                <div className={`fee-card ${getBalanceColor().replace('bg-', 'fee-card-')}`}>
                  <div className="fee-card-icon">💬</div>
                  <div className="fee-card-content">
                    <div className="fee-card-label">BALANCE</div>
                    <div className="fee-card-amount">{formatCurrency(fees.fee_balance)}</div>
                    <div className="fee-card-description">
                      {fees.fee_balance <= 0 ? "Fully paid" : "Outstanding amount"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="payment-progress-card">
                <h4>Payment Progress</h4>
                <div className="progress-info">
                  <span>Progress: {getPaymentProgress()}%</span>
                  <span>Session Progress: {fees.session_progress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${getPaymentProgress()}%` }}
                  ></div>
                </div>
              </div>

              {/* Status Alerts */}
              {fees.fee_balance <= 0 && (
                <div className="status-alert success">
                  <span className="alert-icon">✅</span>
                  <div className="alert-content">
                    <h4>Congratulations!</h4>
                    <p>Your fees are fully paid. You're up to date with all financial obligations.</p>
                  </div>
                </div>
              )}

              {fees.fee_balance > 0 && fees.fee_balance <= 10000 && (
                <div className="status-alert warning">
                  <span className="alert-icon">⚠️</span>
                  <div className="alert-content">
                    <h4>Small Outstanding Balance</h4>
                    <p>You have a small outstanding balance. Consider clearing it soon to avoid any issues.</p>
                  </div>
                </div>
              )}

              {fees.fee_balance > 10000 && (
                <div className="status-alert danger">
                  <span className="alert-icon">🚨</span>
                  <div className="alert-content">
                    <h4>Outstanding Balance</h4>
                    <p>You have an outstanding balance. Please make a payment to avoid penalties.</p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="quick-actions">
                <h4>Quick Actions</h4>
                <div className="actions-grid">
                  <button 
                    className="action-btn primary"
                    onClick={() => setIsStatementModalOpen(true)}
                  >
                    <span>📄</span>
                    View Fee Statement
                  </button>
                  <button 
                    className="action-btn secondary"
                    onClick={() => setIsExamCardModalOpen(true)}
                  >
                    <span>🎓</span>
                    Generate Exam Card
                  </button>
                  <button 
                    className="action-btn success"
                    onClick={handleMakePayment}
                  >
                    <span>💸</span>
                    Make Payment
                  </button>
                  <button 
                    className="action-btn info"
                    onClick={onRefresh}
                  >
                    <span>🔄</span>
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="finance-tab">
              <div className="tab-header">
                <h3>Payment History</h3>
                <p>View all your payment records and transaction history</p>
              </div>

              <div className="payments-table-container">
                {fees.payments && fees.payments.length > 0 ? (
                  <table className="payments-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Reference</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fees.payments.map((payment) => (
                        <tr key={payment.id}>
                          <td>{formatDate(payment.payment_date)}</td>
                          <td className="amount">{formatCurrency(payment.amount)}</td>
                          <td>
                            <span className="payment-method">
                              {payment.payment_method || 'Cash'}
                            </span>
                          </td>
                          <td>{payment.reference_number || 'N/A'}</td>
                          <td>{payment.notes || '-'}</td>
                          <td>
                            <button 
                              className="action-btn-small"
                              onClick={() => handleDownloadReceipt(payment.id)}
                            >
                              📄 Receipt
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data">
                    <span className="no-data-icon">💳</span>
                    <h4>No Payment Records</h4>
                    <p>No payment records found. Make a payment to see your transaction history here.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "statements" && (
            <div className="finance-tab">
              <div className="tab-header">
                <h3>Fee Statements</h3>
                <p>Download and view your fee statements and financial documents</p>
              </div>

              <div className="statements-grid">
                <div className="statement-card">
                  <div className="statement-icon">📄</div>
                  <div className="statement-content">
                    <h4>Current Fee Statement</h4>
                    <p>View your current semester fee statement with all charges and payments</p>
                    <button 
                      className="action-btn primary"
                      onClick={() => setIsStatementModalOpen(true)}
                    >
                      View Statement
                    </button>
                  </div>
                </div>

                <div className="statement-card">
                  <div className="statement-icon">📋</div>
                  <div className="statement-content">
                    <h4>Payment Summary</h4>
                    <p>Summary of all payments made and outstanding balances</p>
                    <button className="action-btn secondary">
                      Coming Soon
                    </button>
                  </div>
                </div>

                <div className="statement-card">
                  <div className="statement-icon">🧾</div>
                  <div className="statement-content">
                    <h4>Tax Receipts</h4>
                    <p>Download tax receipts for your education expenses</p>
                    <button className="action-btn secondary">
                      Coming Soon
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "semester-fees" && (
            <div className="finance-tab">
              <div className="tab-header">
                <h3>Semester Fees</h3>
                <p>View fee breakdown by semester and academic year</p>
              </div>

              <div className="semester-fees-container">
                {fees.fees && fees.fees.length > 0 ? (
                  <div className="fees-table-container">
                    <table className="fees-table">
                      <thead>
                        <tr>
                          <th>Semester</th>
                          <th>Total Fee</th>
                          <th>Amount Paid</th>
                          <th>Balance</th>
                          <th>Due Date</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.fees.map((fee) => (
                          <tr key={fee.id}>
                            <td className="semester">{fee.semester}</td>
                            <td className="amount">{formatCurrency(fee.total_fee)}</td>
                            <td className="amount paid">{formatCurrency(fee.amount_paid)}</td>
                            <td className={`amount ${fee.balance > 0 ? 'outstanding' : 'paid'}`}>
                              {formatCurrency(fee.balance)}
                            </td>
                            <td>{formatDate(fee.due_date)}</td>
                            <td>
                              <span className={`status-badge ${fee.balance <= 0 ? 'paid' : 'pending'}`}>
                                {fee.balance <= 0 ? 'PAID' : 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-data">
                    <span className="no-data-icon">🗓️</span>
                    <h4>No Fee Records</h4>
                    <p>No semester fee records found. Fee information will appear here once billing is processed.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "make-payment" && (
            <div className="finance-tab">
              <div className="tab-header">
                <h3>Make Payment</h3>
                <p>Pay your fees securely using various payment methods</p>
              </div>

              <div className="payment-form-container">
                <div className="payment-summary">
                  <h4>Payment Summary</h4>
                  <div className="summary-item">
                    <span>Outstanding Balance:</span>
                    <span className="amount">{formatCurrency(fees.fee_balance)}</span>
                  </div>
                  <div className="summary-item">
                    <span>Minimum Payment:</span>
                    <span className="amount">{formatCurrency(Math.min(fees.fee_balance, 10000))}</span>
                  </div>
                </div>

                <div className="payment-methods">
                  <h4>Available Payment Methods</h4>
                  <div className="methods-grid">
                    <div className="payment-method-card">
                      <div className="method-icon">💳</div>
                      <h5>Bank Transfer</h5>
                      <p>Transfer directly from your bank account</p>
                      <button className="action-btn primary" onClick={handleMakePayment}>
                        Select
                      </button>
                    </div>

                    <div className="payment-method-card">
                      <div className="method-icon">📱</div>
                      <h5>M-Pesa</h5>
                      <p>Pay using M-Pesa mobile money</p>
                      <button className="action-btn primary" onClick={handleMakePayment}>
                        Select
                      </button>
                    </div>

                    <div className="payment-method-card">
                      <div className="method-icon">🏦</div>
                      <h5>Bank Deposit</h5>
                      <p>Make a deposit at any bank branch</p>
                      <button className="action-btn primary" onClick={handleMakePayment}>
                        Select
                      </button>
                    </div>

                    <div className="payment-method-card">
                      <div className="method-icon">💰</div>
                      <h5>Cash Payment</h5>
                      <p>Pay in person at the finance office</p>
                      <button className="action-btn primary" onClick={handleMakePayment}>
                        Select
                      </button>
                    </div>
                  </div>
                </div>

                <div className="payment-info">
                  <h4>Payment Information</h4>
                  <div className="info-grid">
                    <div className="info-item">
                      <strong>Bank Name:</strong> KCB Bank Kenya
                    </div>
                    <div className="info-item">
                      <strong>Account Number:</strong> 1234567890
                    </div>
                    <div className="info-item">
                      <strong>Account Name:</strong> CLIPS Technical College
                    </div>
                    <div className="info-item">
                      <strong>M-Pesa Paybill:</strong> 522522
                    </div>
                    <div className="info-item">
                      <strong>Account Number:</strong> Your Registration Number
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fee Statement Modal */}
      {studentData && fees && (
        <FeeStatementModal
          isOpen={isStatementModalOpen}
          onClose={() => setIsStatementModalOpen(false)}
          studentData={{
            name: studentData.name,
            registration_number: studentData.registration_number,
            course: studentData.course,
            level_of_study: studentData.level_of_study
          }}
          feeData={fees}
        />
      )}

      {/* Exam Card Modal */}
      {studentData && (
        <ExamCardGenerator
          isOpen={isExamCardModalOpen}
          onClose={() => setIsExamCardModalOpen(false)}
          studentData={{
            name: studentData.name,
            registration_number: studentData.registration_number,
            level_of_study: studentData.level_of_study,
            course: studentData.course
          }}
          units={[]} // Will be populated from parent component
        />
      )}
    </div>
  )
}

export default EnhancedFinanceSection
