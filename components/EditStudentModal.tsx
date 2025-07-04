"use client"

import React, { useState } from "react"
import { apiRequest } from "@/lib/api"
import { useToast } from "@/hooks/useToast"
import type { Student } from "@/types/student"

interface EditStudentModalProps {
  student: Student
  isOpen: boolean
  onClose: () => void
  onUpdate: (updatedStudent: Student) => void
}

export function EditStudentModal({ student, isOpen, onClose, onUpdate }: EditStudentModalProps) {
  const [formData, setFormData] = useState({
    name: student.name,
    registration_number: student.registration_number,
    email: student.email || "",
    course: student.course,
    level_of_study: student.level_of_study,
    national_id: student.national_id || "",
    birth_certificate: student.birth_certificate || "",
    date_of_birth: student.date_of_birth || "",
    status: student.status || "active"
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useToast()

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const getAge = () => calculateAge(formData.date_of_birth)
  const isAdult = getAge() >= 18

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate based on age
    const age = getAge()
    if (age >= 18 && !formData.national_id) {
      showToast("National ID is required for students 18 years and older", "error")
      setIsSubmitting(false)
      return
    }
    
    if (age < 18 && !formData.birth_certificate) {
      showToast("Birth certificate is required for students under 18 years", "error")
      setIsSubmitting(false)
      return
    }

    try {
      const result = await apiRequest(`/api/students/${student.id}`, {
        method: "PUT",
        body: JSON.stringify(formData)
      })

      if (result.success) {
        showToast("Student updated successfully", "success")
        onUpdate(result.data.student)
        onClose()
      } else {
        showToast(result.error || "Failed to update student", "error")
      }
    } catch (error) {
      showToast("Failed to update student", "error")
    } finally {
      setIsSubmitting(false)
    }
  }
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-semibold mb-4">Edit Student</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">Registration Number *</label>
            <input
              id="registration_number"
              type="text"
              value={formData.registration_number}
              onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
            <input
              id="course"
              type="text"
              value={formData.course}
              onChange={(e) => setFormData({ ...formData, course: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="level_of_study" className="block text-sm font-medium text-gray-700 mb-1">Level of Study *</label>
            <input
              id="level_of_study"
              type="text"
              value={formData.level_of_study}
              onChange={(e) => setFormData({ ...formData, level_of_study: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "deregistered" | "on_leave" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="active">Active</option>
              <option value="deregistered">Deregistered</option>
              <option value="on_leave">On Leave</option>
            </select>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-white rounded-md transition-colors ${
                isSubmitting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
  
}