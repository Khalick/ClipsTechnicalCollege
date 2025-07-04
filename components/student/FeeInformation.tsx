"use client"

import React from 'react';

interface FeeData {
  fee_balance: number
  total_paid: number
  semester_fee: number
  session_progress: number
}

interface FeeInformationProps {
  fees: FeeData | null
  onRefresh?: () => void
}

export function FeeInformation({ fees, onRefresh }: FeeInformationProps) {
  const feeData = fees;

  if (!feeData) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="text-blue-600">💰</span> Fee Information
        </h2>
        <div className="text-gray-600">
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
    const totalBilled = feeData.semester_fee
    if (totalBilled <= 0) return 0
    return Math.round((feeData.total_paid / totalBilled) * 100)
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <span className="text-blue-600">💰</span> Fee Information
        </h2>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
          >
            <span>🔄</span> Refresh
          </button>
        )}
      </div>

      {/* Payment Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Payment Progress</span>
          <span className="text-sm text-gray-600">{getPaymentProgress()}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`bg-blue-600 h-2 rounded-full transition-all duration-300`}
            style={{ width: `${Math.min(getPaymentProgress(), 100)}%` }}
          ></div>
        </div>
      </div>

      <div className="flex gap-0 max-w-4xl mx-auto">
        {/* Total Billed Card */}
        <div className="flex-1 bg-orange-500 text-white p-6 relative">
          <div className="flex items-start gap-4">
            <div className="text-3xl opacity-80">
              🏷️
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90 mb-1">TOTAL BILLED:</div>
              <div className="text-2xl font-bold mb-3">KSh. {feeData.semester_fee.toLocaleString()}.00</div>
              <button className="bg-transparent border-b border-white text-white text-sm hover:bg-white hover:bg-opacity-10 transition-colors duration-200 pb-1">
                View Details →
              </button>
            </div>
          </div>
        </div>

        {/* Total Paid Card */}
        <div className="flex-1 bg-green-500 text-white p-6 relative">
          <div className="flex items-start gap-4">
            <div className="text-3xl opacity-80">
              💚
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90 mb-1">TOTAL PAID:</div>
              <div className="text-2xl font-bold mb-3">KSh. {feeData.total_paid.toLocaleString()}.00</div>
              <button className="bg-transparent border-b border-white text-white text-sm hover:bg-white hover:bg-opacity-10 transition-colors duration-200 pb-1">
                View Details →
              </button>
            </div>
          </div>
        </div>

        {/* Balance Card */}
        <div className={`flex-1 ${getBalanceColor()} text-white p-6 relative`}>
          <div className="flex items-start gap-4">
            <div className="text-3xl opacity-80">
              💬
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium opacity-90 mb-1">BALANCE:</div>
              <div className="text-2xl font-bold mb-3">KSh. {feeData.fee_balance.toLocaleString()}.00</div>
              <button className="bg-transparent border-b border-white text-white text-sm hover:bg-white hover:bg-opacity-10 transition-colors duration-200 pb-1">
                View Details →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Status Alert */}
      {feeData.fee_balance <= 0 && (
        <div className="mt-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>✅</span>
          <span className="font-medium">Congratulations! Your fees are fully paid.</span>
        </div>
      )}

      {feeData.fee_balance > 0 && feeData.fee_balance <= 10000 && (
        <div className="mt-6 bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>⚠️</span>
          <span className="font-medium">You have a small outstanding balance. Consider clearing it soon.</span>
        </div>
      )}

      {feeData.fee_balance > 10000 && (
        <div className="mt-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <span>🚨</span>
          <span className="font-medium">You have an outstanding balance. Please make a payment to avoid penalties.</span>
        </div>
      )}

      {/* Payment Actions */}
      <div className="flex gap-4 justify-center mt-8">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <span>💳</span>
          Pay Fees
        </button>
        <button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors duration-200">
          <span>📥</span>
          Download Statement
        </button>
      </div>
    </div>
  )
}