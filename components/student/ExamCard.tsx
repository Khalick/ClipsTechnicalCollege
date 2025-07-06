"use client"

import React, { useState, useEffect } from 'react'
import { X, Printer, Download } from 'lucide-react'
import { useStudentAuth } from '@/hooks/useStudentAuth'
import { useToast } from '@/hooks/useToast'

interface ExamCardData {
  student: {
    id: string
    name: string
    registration_number: string
    course: string
    level_of_study: string
    email?: string
    photo_url?: string
    status: string
  }
  units: Array<{
    id: string
    unit_name: string
    unit_code: string
    credits: number
    description?: string
    registration_date: string
  }>
  summary: {
    total_units: number
    total_credits: number
    semester: string
    generated_at: string
  }
}

interface ExamCardProps {
  isOpen: boolean
  onClose: () => void
}

export function ExamCard({ isOpen, onClose }: ExamCardProps) {
  const [examCardData, setExamCardData] = useState<ExamCardData | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useStudentAuth()
  const { showToast } = useToast()

  useEffect(() => {
    if (isOpen && user?.registrationNumber) {
      fetchExamCardData()
    }
  }, [isOpen, user])

  const fetchExamCardData = async () => {
    if (!user?.registrationNumber) return

    setLoading(true)
    try {
      const response = await fetch(`/api/students/exam-card/${user.registrationNumber}`)
      const result = await response.json()

      if (result.success) {
        setExamCardData(result.data)
      } else {
        showToast('Error loading exam card data', 'error')
      }
    } catch (error) {
      console.error('Error fetching exam card data:', error)
      showToast('Error loading exam card data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none">
        {/* Modal Header - Hidden in print */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
          <h2 className="text-2xl font-bold text-gray-800">Exam Card</h2>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
              title="Print Exam Card"
            >
              <Printer size={16} />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Close modal"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Exam Card Content */}
        <div className="p-6 print:p-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading exam card...</span>
            </div>
          ) : examCardData ? (
            <div className="space-y-6">
              {/* Institution Header */}
              <div className="text-center border-b-2 border-blue-600 pb-4">
                <h1 className="text-3xl font-bold text-blue-600 mb-2 print:text-2xl">CLIPS TECHNICAL COLLEGE</h1>
                <p className="text-xl text-gray-800 font-semibold print:text-lg">EXAMINATION CARD</p>
                <p className="text-sm text-gray-600 mt-2">{examCardData.summary.semester}</p>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Student Photo */}
                <div className="flex justify-center md:justify-start">
                  <div className="w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    {examCardData.student.photo_url ? (
                      <img
                        src={examCardData.student.photo_url}
                        alt="Student Photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="text-4xl mb-2">👤</div>
                        <div className="text-xs">No Photo</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Student Details */}
                <div className="md:col-span-2">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-3 font-semibold text-gray-700 pr-4">Name:</td>
                        <td className="py-3 text-gray-900 font-medium">{examCardData.student.name}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-semibold text-gray-700 pr-4">Registration Number:</td>
                        <td className="py-3 text-gray-900 font-medium">{examCardData.student.registration_number}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-semibold text-gray-700 pr-4">Course:</td>
                        <td className="py-3 text-gray-900">{examCardData.student.course}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-3 font-semibold text-gray-700 pr-4">Level:</td>
                        <td className="py-3 text-gray-900">{examCardData.student.level_of_study}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-semibold text-gray-700 pr-4">Total Credits:</td>
                        <td className="py-3 text-gray-900 font-semibold">{examCardData.summary.total_credits}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Registered Units */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">REGISTERED UNITS</h3>
                {examCardData.units.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300 text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Unit Code</th>
                          <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Unit Name</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Credits</th>
                          <th className="border border-gray-300 px-4 py-3 text-center font-semibold">Registration Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {examCardData.units.map((unit, index) => (
                          <tr key={unit.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-3 font-medium">{unit.unit_code}</td>
                            <td className="border border-gray-300 px-4 py-3">{unit.unit_name}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center">{unit.credits}</td>
                            <td className="border border-gray-300 px-4 py-3 text-center">{formatDate(unit.registration_date)}</td>
                          </tr>
                        ))}
                        <tr className="bg-blue-50 font-semibold">
                          <td className="border border-gray-300 px-4 py-3" colSpan={2}>TOTAL</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{examCardData.summary.total_credits}</td>
                          <td className="border border-gray-300 px-4 py-3 text-center">{examCardData.summary.total_units} units</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-4xl mb-4">📚</div>
                    <p>No units registered yet</p>
                    <p className="text-sm">Please register for units to generate your exam card</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-4">EXAMINATION INSTRUCTIONS:</h4>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• This card must be presented during all examinations</li>
                    <li>• Report any discrepancies to the Academic Office immediately</li>
                    <li>• Lost cards must be reported and replaced before examinations</li>
                    <li>• This card is not transferable</li>
                  </ul>
                </div>
                <div className="text-right">
                  <div className="mb-6">
                    <div className="border-b border-gray-400 w-48 ml-auto mb-2"></div>
                    <p className="text-xs text-gray-600">Academic Office Signature</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Generated on: {formatDate(examCardData.summary.generated_at)}</p>
                    <p className="text-xs text-gray-600">Valid for: {examCardData.summary.semester}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">❌</div>
              <p>Unable to load exam card data</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
