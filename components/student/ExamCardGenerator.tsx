"use client"

import React from 'react'
import { X, Download, Printer } from 'lucide-react'

interface ExamCardProps {
  isOpen: boolean
  onClose: () => void
  studentData: {
    name: string
    registration_number: string
    level_of_study: string
    course: string
  }
  units: Array<{
    code: string
    name: string
  }>
}

export function ExamCardGenerator({ isOpen, onClose, studentData, units }: ExamCardProps) {
  if (!isOpen) return null

  const handlePrint = async () => {
    try {
      const response = await fetch('/api/generate-pdf/exam-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentData, units }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `exam-card-${studentData.registration_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF')
    }
  }

  const handleDownload = async () => {
    try {
      const response = await fetch('/api/generate-pdf/exam-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentData, units }),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `exam-card-${studentData.registration_number}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none">
        {/* Modal Header - Hidden in print */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
          <h2 className="text-2xl font-bold text-gray-800">Exam Card</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Close"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Exam Card Content */}
        <div className="p-8 print:p-4 print:min-h-screen print:max-h-screen print:overflow-hidden">
          {/* Header */}
          <div className="text-center border-b-2 border-gray-800 pb-4 mb-4">
            <h1 className="text-2xl font-bold text-blue-600 mb-1 print:text-xl">CLIPS TECHNICAL COLLEGE</h1>
            <h2 className="text-lg font-semibold text-gray-800 mb-1 print:text-base">EXAMINATION CARD</h2>
            <p className="text-xs text-gray-600">Academic Year: {new Date().getFullYear()}</p>
          </div>

          {/* Student Information */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800 mb-2 border-b pb-1 print:text-sm">STUDENT INFORMATION</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="py-1 font-semibold text-gray-700 w-1/3 text-sm">Name:</td>
                      <td className="py-1 text-gray-900 font-medium text-sm">{studentData.name}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 font-semibold text-gray-700 text-sm">Registration No:</td>
                      <td className="py-1 text-gray-900 font-medium text-sm">{studentData.registration_number}</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-1 font-semibold text-gray-700 text-sm">Course:</td>
                      <td className="py-1 text-gray-900 text-sm">{studentData.course}</td>
                    </tr>
                    <tr>
                      <td className="py-1 font-semibold text-gray-700 text-sm">Level:</td>
                      <td className="py-1 text-gray-900 text-sm">{studentData.level_of_study}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="flex justify-center items-center">
                <div className="w-24 h-32 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 text-xs print:w-20 print:h-24">
                  STUDENT PHOTO
                </div>
              </div>
            </div>
          </div>

          {/* Registered Units */}
          <div className="mb-4">
            <h3 className="text-base font-bold text-gray-800 mb-2 border-b pb-1 print:text-sm">REGISTERED UNITS</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-2 border-gray-800">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-2 py-2 text-left font-bold text-gray-800 border-b-2 border-gray-800 text-sm">S/No</th>
                    <th className="px-2 py-2 text-left font-bold text-gray-800 border-b-2 border-gray-800 text-sm">Unit Code</th>
                    <th className="px-2 py-2 text-left font-bold text-gray-800 border-b-2 border-gray-800 text-sm">Unit Name</th>
                    <th className="px-2 py-2 text-center font-bold text-gray-800 border-b-2 border-gray-800 text-sm">Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((unit, index) => (
                    <tr key={index} className="border-b border-gray-400">
                      <td className="px-2 py-2 font-medium text-sm">{index + 1}</td>
                      <td className="px-2 py-2 font-medium text-sm">{unit.code}</td>
                      <td className="px-2 py-2 text-sm">{unit.name}</td>
                      <td className="px-2 py-2 text-center">
                        <div className="h-6 border-b border-gray-400 w-16 mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                  {/* Add empty rows if less than 8 units */}
                  {Array.from({ length: Math.max(0, 8 - units.length) }).map((_, index) => (
                    <tr key={`empty-${index}`} className="border-b border-gray-400">
                      <td className="px-2 py-2 text-sm">{units.length + index + 1}</td>
                      <td className="px-2 py-2"></td>
                      <td className="px-2 py-2"></td>
                      <td className="px-2 py-2 text-center">
                        <div className="h-6 border-b border-gray-400 w-16 mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures Section */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-sm">STUDENT DECLARATION</h4>
              <p className="text-xs text-gray-700 mb-3">
                I declare that the information provided above is correct and I understand the examination rules and regulations.
              </p>
              <div className="border-t-2 border-gray-800 pt-1">
                <p className="text-xs font-semibold">Student Signature & Date</p>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-sm">INVIGILATOR VERIFICATION</h4>
              <p className="text-xs text-gray-700 mb-3">
                I have verified the student's identity and confirmed their eligibility to sit for the examination.
              </p>
              <div className="border-t-2 border-gray-800 pt-1">
                <p className="text-xs font-semibold">Invigilator Signature & Date</p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center border-t-2 border-gray-800 pt-2">
            <p className="text-xs text-gray-600">
              This exam card is valid only for the current academic session and must be presented during all examinations.
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Generated on: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}