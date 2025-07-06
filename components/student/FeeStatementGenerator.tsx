"use client"

import { useState, useEffect } from 'react'

interface FeeStatementGeneratorProps {
  studentData: {
    name: string
    registration_number: string
    course: string
    level_of_study: string
  }
  onGenerate: () => void
}

export function FeeStatementGenerator({ studentData, onGenerate }: FeeStatementGeneratorProps) {
  const [feeData, setFeeData] = useState<any>(null)

  useEffect(() => {
    fetchFeeData()
  }, [])

  const fetchFeeData = async () => {
    try {
      const response = await fetch(`/api/students/fees/${studentData.registration_number}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setFeeData(result.data)
        }
      }
    } catch (error) {
      console.error('Error fetching fee data:', error)
    }
  }

  const handleGenerate = async () => {
    if (feeData) {
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
        
        onGenerate()
      } catch (error) {
        console.error('Error generating PDF:', error)
        alert('Error generating PDF')
      }
    }
  }

  return (
    <button onClick={handleGenerate} className="action-btn">
      Generate Fee Statement
    </button>
  )
}