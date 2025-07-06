"use client"

import { useState } from 'react'
import { Download, FileText, CreditCard, Loader2 } from 'lucide-react'

interface QuickDocumentGeneratorProps {
  registrationNumber: string
  className?: string
}

export function QuickDocumentGenerator({ registrationNumber, className = '' }: QuickDocumentGeneratorProps) {
  const [examCardLoading, setExamCardLoading] = useState(false)
  const [feeStatementLoading, setFeeStatementLoading] = useState(false)

  const handleGenerateExamCard = async () => {
    setExamCardLoading(true)
    try {
      const response = await fetch('/api/generate-pdf/exam-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber
        }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `exam-card-${registrationNumber}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const error = await response.json()
        alert('Error generating exam card: ' + error.error)
      }
    } catch (error) {
      console.error('Error generating exam card:', error)
      alert('Error generating exam card')
    } finally {
      setExamCardLoading(false)
    }
  }

  const handleGenerateFeeStatement = async () => {
    setFeeStatementLoading(true)
    try {
      const response = await fetch('/api/generate-pdf/fee-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber
        }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fee-statement-${registrationNumber}.pdf`
        a.click()
        URL.revokeObjectURL(url)
      } else {
        const error = await response.json()
        alert('Error generating fee statement: ' + error.error)
      }
    } catch (error) {
      console.error('Error generating fee statement:', error)
      alert('Error generating fee statement')
    } finally {
      setFeeStatementLoading(false)
    }
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      <button
        onClick={handleGenerateExamCard}
        disabled={examCardLoading}
        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {examCardLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <FileText className="h-4 w-4" />
        )}
        Exam Card
      </button>

      <button
        onClick={handleGenerateFeeStatement}
        disabled={feeStatementLoading}
        className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
      >
        {feeStatementLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <CreditCard className="h-4 w-4" />
        )}
        Fee Statement
      </button>
    </div>
  )
}

// Hook for easy integration with existing components
export function useDocumentGeneration(registrationNumber: string) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateExamCard = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-pdf/exam-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationNumber }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `exam-card-${registrationNumber}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setIsGenerating(false)
    }
  }

  const generateFeeStatement = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/generate-pdf/fee-statement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ registrationNumber }),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `fee-statement-${registrationNumber}.pdf`
        a.click()
        URL.revokeObjectURL(url)
        return { success: true }
      } else {
        const error = await response.json()
        return { success: false, error: error.error }
      }
    } catch (error) {
      return { success: false, error: 'Network error' }
    } finally {
      setIsGenerating(false)
    }
  }

  return {
    generateExamCard,
    generateFeeStatement,
    isGenerating
  }
}
