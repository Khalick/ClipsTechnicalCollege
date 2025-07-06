"use client"

import { useState } from 'react'
import { Download, FileText, CreditCard, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { generateExamCardWithValidation, generateFeeStatementWithValidation, generateStudentDocuments, validateStudentForDocuments } from '@/lib/document-generator'

interface DocumentGeneratorProps {
  studentData: {
    name: string
    registration_number: string
    course: string
    level_of_study: string
  }
}

export function DocumentGenerator({ studentData }: DocumentGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [examCardLoading, setExamCardLoading] = useState(false)
  const [feeStatementLoading, setFeeStatementLoading] = useState(false)
  const [bothLoading, setBothLoading] = useState(false)
  const [validation, setValidation] = useState<any>(null)
  const [validationLoading, setValidationLoading] = useState(false)

  const handleGenerateExamCard = async () => {
    setExamCardLoading(true)
    try {
      const result = await generateExamCardWithValidation(studentData.registration_number)
      if (result.success) {
        // Success notification will be handled by the download
        console.log('Exam card generated successfully')
      } else {
        alert('Error generating exam card: ' + result.error)
      }
    } catch (error) {
      alert('Error generating exam card: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setExamCardLoading(false)
    }
  }

  const handleGenerateFeeStatement = async () => {
    setFeeStatementLoading(true)
    try {
      const result = await generateFeeStatementWithValidation(studentData.registration_number)
      if (result.success) {
        // Success notification will be handled by the download
        console.log('Fee statement generated successfully')
      } else {
        alert('Error generating fee statement: ' + result.error)
      }
    } catch (error) {
      alert('Error generating fee statement: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setFeeStatementLoading(false)
    }
  }

  const handleGenerateBoth = async () => {
    setBothLoading(true)
    try {
      const results = await generateStudentDocuments(studentData.registration_number)
      
      let successCount = 0
      let errors = []
      
      if (results.examCard.success) {
        successCount++
      } else {
        errors.push('Exam Card: ' + results.examCard.error)
      }
      
      if (results.feeStatement.success) {
        successCount++
      } else {
        errors.push('Fee Statement: ' + results.feeStatement.error)
      }
      
      if (successCount === 2) {
        alert('Both documents generated successfully!')
      } else if (successCount === 1) {
        alert(`One document generated successfully. Errors: ${errors.join(', ')}`)
      } else {
        alert('Failed to generate documents. Errors: ' + errors.join(', '))
      }
    } catch (error) {
      alert('Error generating documents: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setBothLoading(false)
    }
  }

  const handleValidateStudent = async () => {
    setValidationLoading(true)
    try {
      const result = await validateStudentForDocuments(studentData.registration_number)
      setValidation(result)
    } catch (error) {
      console.error('Error validating student:', error)
      setValidation({
        isValid: false,
        hasStudentData: false,
        hasFeeData: false,
        hasUnits: false,
        message: 'Error validating student data'
      })
    } finally {
      setValidationLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Student Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate Documents</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <span className="text-sm text-gray-600">Student Name:</span>
            <p className="font-medium">{studentData.name}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Registration Number:</span>
            <p className="font-medium">{studentData.registration_number}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Course:</span>
            <p className="font-medium">{studentData.course}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">Level:</span>
            <p className="font-medium">{studentData.level_of_study}</p>
          </div>
        </div>

        {/* Validation Section */}
        <div className="mb-6">
          <button
            onClick={handleValidateStudent}
            disabled={validationLoading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validationLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            Validate Student Data
          </button>
          
          {validation && (
            <div className="mt-4 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {validation.isValid ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {validation.isValid ? 'Student data is valid' : 'Student data validation failed'}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${validation.hasStudentData ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">Student Profile</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${validation.hasFeeData ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm">Fee Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${validation.hasUnits ? 'bg-green-500' : 'bg-yellow-500'}`} />
                  <span className="text-sm">Registered Units</span>
                </div>
              </div>
              
              {validation.message && (
                <p className="text-sm text-gray-600 mt-2">{validation.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Document Generation Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleGenerateExamCard}
            disabled={examCardLoading || isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {examCardLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileText className="h-4 w-4" />
            )}
            Generate Exam Card
          </button>

          <button
            onClick={handleGenerateFeeStatement}
            disabled={feeStatementLoading || isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {feeStatementLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CreditCard className="h-4 w-4" />
            )}
            Generate Fee Statement
          </button>

          <button
            onClick={handleGenerateBoth}
            disabled={bothLoading || isGenerating}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {bothLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Generate Both Documents
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Click "Validate Student Data" to check if all required information is available</li>
          <li>• Use "Generate Exam Card" to create and download the student's exam card</li>
          <li>• Use "Generate Fee Statement" to create and download the student's fee statement</li>
          <li>• Use "Generate Both Documents" to create both documents simultaneously</li>
          <li>• Documents will be automatically downloaded as PDF files</li>
        </ul>
      </div>
    </div>
  )
}
