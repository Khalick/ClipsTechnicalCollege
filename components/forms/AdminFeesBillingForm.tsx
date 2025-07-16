"use client"

import React, { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/useToast"
import { apiRequest } from "@/lib/api"

interface Student {
  id: string
  name: string
  registration_number: string
  course: string
}

interface FeeRecord {
  id: string
  student_id: string
  semester: string
  // Support both old and new column names
  total_fee?: number
  total_billed?: number
  semester_fee?: number
  amount_paid?: number
  total_paid?: number
  balance?: number
  fee_balance?: number
  due_date: string
  students: Student
  actual_paid?: number
}

export function AdminFeesBillingForm() {
  const [activeTab, setActiveTab] = useState<'bill' | 'payment' | 'view' | 'bulk'>('bill')
  const [students, setStudents] = useState<Student[]>([])
  const [fees, setFees] = useState<FeeRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingStudents, setIsLoadingStudents] = useState(false)
  const [isLoadingFees, setIsLoadingFees] = useState(false)
  const [feesSummary, setFeesSummary] = useState({ totalBilled: 0, totalPaid: 0, totalBalance: 0 })
  const { showToast } = useToast()

  // Billing form states
  const [selectedStudent, setSelectedStudent] = useState("")
  const [semester, setSemester] = useState("")
  const [totalFee, setTotalFee] = useState<number | "">("")
  const [dueDate, setDueDate] = useState("")

  // Payment form states
  const [paymentStudent, setPaymentStudent] = useState("")
  const [paymentAmount, setPaymentAmount] = useState<number | "">("")
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [referenceNumber, setReferenceNumber] = useState("")
  const [paymentNotes, setPaymentNotes] = useState("")

  // Bulk billing states
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([])
  const [bulkSemester, setBulkSemester] = useState("")
  const [bulkTotalFee, setBulkTotalFee] = useState<number | "">("")
  const [bulkDueDate, setBulkDueDate] = useState("")

  // View filters
  const [filterSemester, setFilterSemester] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStudents()
    fetchFees()
  }, [])

  const fetchStudents = async () => {
    setIsLoadingStudents(true)
    try {
      const result = await apiRequest('/api/students')
      if (result.success) {
        setStudents(result.data)
      } else {
        showToast("Failed to load students", "error")
      }
    } catch (error) {
      showToast("Error loading students", "error")
    } finally {
      setIsLoadingStudents(false)
    }
  }

  const fetchFees = async (selectedSemester = '') => {
    setIsLoadingFees(true)
    try {
      const queryParam = selectedSemester ? `?semester=${encodeURIComponent(selectedSemester)}` : ''
      const result = await apiRequest(`/api/admin/fees${queryParam}`)
      
      console.log('Fees data received:', result)
      
      if (result.success && result.data) {
        // Log the first fee record to see its structure
        if (result.data.length > 0) {
          console.log('Sample fee record structure:', Object.keys(result.data[0]))
          console.log('Sample fee data:', result.data[0])
        }
        

        
        // Fetch payments to get actual paid amounts
        const paymentsResult = await apiRequest('/api/admin/payments')
        const payments = paymentsResult.success ? paymentsResult.data : []
        
        // Calculate summary totals with actual payments
        const totalBilled = result.data.reduce((sum: number, fee: FeeRecord) => 
          sum + (fee.semester_fee || fee.total_billed || fee.total_fee || 0), 0)
        
        const totalPaid = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0)
        const totalBalance = totalBilled - totalPaid
        
        setFeesSummary({ totalBilled, totalPaid, totalBalance })
        
        // Add actual payments to fee records
        const feesWithPayments = result.data.map((fee: FeeRecord) => {
          const studentPayments = payments.filter((p: any) => p.student_id === fee.student_id)
          const actualPaid = studentPayments.reduce((sum: number, p: any) => sum + p.amount, 0)
          return { ...fee, actual_paid: actualPaid }
        })
        
        setFees(feesWithPayments)
      } else {
        console.error('Error fetching fees:', result.error || 'Unknown error')
        showToast("Failed to fetch fee records", "error")
      }
    } catch (error) {
      console.error('Exception in fetchFees:', error)
      showToast("Error loading fee data", "error")
    } finally {
      setIsLoadingFees(false)
    }
  }

  const handleBillStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudent || !semester || !totalFee || !dueDate) {
      showToast("Please fill in all billing fields", "error")
      return
    }

    setIsLoading(true)
    try {
      const result = await apiRequest('/api/admin/fees', {
        method: 'POST',
        body: JSON.stringify({
          student_id: parseInt(selectedStudent),
          semester,
          total_billed: Number(totalFee),
          due_date: dueDate
        })
      })

      if (result.success) {
        showToast("Student billed successfully!", "success")
        setSelectedStudent("")
        setSemester("")
        setTotalFee("")
        setDueDate("")
        fetchFees() // Refresh fees list
      } else {
        showToast(result.error || "Failed to bill student", "error")
      }
    } catch (error) {
      showToast("Error billing student", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleBulkBilling = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedStudentIds.length || !bulkSemester || !bulkTotalFee || !bulkDueDate) {
      showToast("Please fill in all bulk billing fields and select students", "error")
      return
    }

    setIsLoading(true)
    try {
      const result = await apiRequest('/api/admin/fees', {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'bulk_bill',
          data: {
            student_ids: selectedStudentIds.map(id => parseInt(id)),
            semester: bulkSemester,
            total_fee: Number(bulkTotalFee), // Leave as total_fee since the API now expects this
            due_date: bulkDueDate
          }
        })
      })

      if (result.success) {
        showToast(`Successfully billed ${selectedStudentIds.length} students!`, "success")
        setSelectedStudentIds([])
        setBulkSemester("")
        setBulkTotalFee("")
        setBulkDueDate("")
        fetchFees() // Refresh fees list
      } else {
        showToast(result.error || "Failed to bill students", "error")
      }
    } catch (error) {
      showToast("Error billing students", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    )
  }

  const selectAllStudents = () => {
    if (selectedStudentIds.length === students.length) {
      setSelectedStudentIds([])
    } else {
      setSelectedStudentIds(students.map(s => s.id))
    }
  }

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!paymentStudent || !paymentAmount) {
      showToast("Please enter student registration number and amount", "error")
      return
    }

    setIsLoading(true)
    try {
      const result = await apiRequest('/api/finance/record-payment', {
        method: 'POST',
        body: JSON.stringify({
          registration_number: paymentStudent.trim(),
          amount: Number(paymentAmount),
          payment_method: paymentMethod,
          reference_number: referenceNumber || null,
          notes: paymentNotes || null
        })
      })

      if (result.success) {
        showToast("Payment recorded successfully!", "success")
        setPaymentStudent("")
        setPaymentAmount("")
        setReferenceNumber("")
        setPaymentNotes("")
        fetchFees() // Refresh fees list
      } else {
        showToast(result.error || "Failed to record payment", "error")
      }
    } catch (error) {
      showToast("Error recording payment", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentSemester = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1
    
    if (month <= 6) {
      return `${year}-Semester-1`
    } else {
      return `${year}-Semester-2`
    }
  }

  const getDefaultDueDate = () => {
    const now = new Date()
    const dueDate = new Date(now.getFullYear(), now.getMonth() + 2, 15) // 2 months from now
    return dueDate.toISOString().split('T')[0]
  }

  const filteredFees = fees.filter(fee => {
    const matchesSearch = fee.students.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         fee.students.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesSemester = !filterSemester || fee.semester === filterSemester
    return matchesSearch && matchesSemester
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusColor = (balance: number) => {
    if (balance <= 0) return 'text-green-600'
    if (balance <= 10000) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getStatusText = (balance: number) => {
    if (balance <= 0) return 'Fully Paid'
    if (balance <= 10000) return 'Almost Paid'
    return 'Outstanding'
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-blue-600">Total Billed</h3>
            <p className="text-2xl font-bold">{formatCurrency(feesSummary.totalBilled)}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-green-600">Total Paid</h3>
            <p className="text-2xl font-bold">{formatCurrency(feesSummary.totalPaid)}</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600">Outstanding Balance</h3>
            <p className="text-2xl font-bold">{formatCurrency(feesSummary.totalBalance)}</p>
          </div>
        </Card>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex space-x-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('bill')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'bill' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bill Students
        </button>
        <button
          onClick={() => setActiveTab('payment')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'payment' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Record Payment
        </button>
        <button
          onClick={() => setActiveTab('bulk')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'bulk' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Bulk Billing
        </button>
        <button
          onClick={() => setActiveTab('view')}
          className={`py-2 px-4 font-medium text-sm ${
            activeTab === 'view' 
              ? 'border-b-2 border-blue-500 text-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          View Fees
        </button>
      </div>

      {/* Bill Students Tab */}
      {activeTab === 'bill' && (
        <Card title="Bill Students">
          <form onSubmit={handleBillStudent} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="student" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-user mr-2"></i>Student
                </label>
                <select
                  id="student"
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a student...</option>
                  {isLoadingStudents ? (
                    <option disabled>Loading students...</option>
                  ) : (
                    students.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.name} ({student.registration_number})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-calendar mr-2"></i>Semester
                </label>
                <input
                  id="semester"
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder={getCurrentSemester()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Example: {getCurrentSemester()}
                </p>
              </div>

              <div className="form-group">
                <label htmlFor="totalFee" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-money-bill-wave mr-2"></i>Total Fee (KES)
                </label>
                <input
                  id="totalFee"
                  type="number"
                  value={totalFee}
                  onChange={(e) => setTotalFee(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Enter total fee amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-calendar-alt mr-2"></i>Due Date
                </label>
                <input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setSemester(getCurrentSemester())
                  setDueDate(getDefaultDueDate())
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Use Current Semester Defaults
              </button>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-file-invoice-dollar mr-2"></i>
                    Bill Student
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Bulk Billing Tab */}
      {activeTab === 'bulk' && (
        <Card title="Bulk Billing">
          <form onSubmit={handleBulkBilling} className="space-y-6">
            {/* Student Selection */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select Students</h3>
                <button
                  type="button"
                  onClick={selectAllStudents}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  {selectedStudentIds.length === students.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="max-h-64 overflow-y-auto border border-gray-200 rounded">
                {isLoadingStudents ? (
                  <div className="p-4 text-center text-gray-500">Loading students...</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {students.map(student => (
                      <label key={student.id} className="flex items-center p-3 hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedStudentIds.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500">{student.registration_number} - {student.course}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {selectedStudentIds.length > 0 && (
                <div className="mt-2 text-sm text-blue-600">
                  {selectedStudentIds.length} student{selectedStudentIds.length > 1 ? 's' : ''} selected
                </div>
              )}
            </div>

            {/* Billing Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="bulkSemester" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-calendar mr-2"></i>Semester
                </label>
                <input
                  id="bulkSemester"
                  type="text"
                  value={bulkSemester}
                  onChange={(e) => setBulkSemester(e.target.value)}
                  placeholder={getCurrentSemester()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="bulkTotalFee" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-money-bill-wave mr-2"></i>Total Fee (KES)
                </label>
                <input
                  id="bulkTotalFee"
                  type="number"
                  value={bulkTotalFee}
                  onChange={(e) => setBulkTotalFee(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Enter total fee amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group md:col-span-2">
                <label htmlFor="bulkDueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-calendar-alt mr-2"></i>Due Date
                </label>
                <input
                  id="bulkDueDate"
                  type="date"
                  value={bulkDueDate}
                  onChange={(e) => setBulkDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  setBulkSemester(getCurrentSemester())
                  setBulkDueDate(getDefaultDueDate())
                }}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Use Current Semester Defaults
              </button>
              
              <button
                type="submit"
                disabled={isLoading || selectedStudentIds.length === 0}
                className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-users mr-2"></i>
                    Bill {selectedStudentIds.length} Student{selectedStudentIds.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* Record Payment Tab */}
      {activeTab === 'payment' && (
        <Card title="Record Payment">
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label htmlFor="paymentStudent" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-id-card mr-2"></i>Student Registration Number
                </label>
                <input
                  id="paymentStudent"
                  type="text"
                  value={paymentStudent}
                  onChange={(e) => setPaymentStudent(e.target.value)}
                  placeholder="Enter registration number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-coins mr-2"></i>Payment Amount (KES)
                </label>
                <input
                  id="paymentAmount"
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Enter payment amount"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-credit-card mr-2"></i>Payment Method
                </label>
                <select
                  id="paymentMethod"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="mpesa">M-Pesa</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                  <option value="card">Card Payment</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="referenceNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  <i className="fas fa-receipt mr-2"></i>Reference Number
                </label>
                <input
                  id="referenceNumber"
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="Transaction reference (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="paymentNotes" className="block text-sm font-medium text-gray-700 mb-1">
                <i className="fas fa-sticky-note mr-2"></i>Notes
              </label>
              <textarea
                id="paymentNotes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Additional payment notes (optional)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-money-check mr-2"></i>
                    Record Payment
                  </>
                )}
              </button>
            </div>
          </form>
        </Card>
      )}

      {/* View Fees Tab */}
      {activeTab === 'view' && (
        <Card title="Fee Records">
          <div className="space-y-4">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Students
                </label>
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or registration number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="filterSemester" className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Semester
                </label>
                <select
                  id="filterSemester"
                  value={filterSemester}
                  onChange={(e) => setFilterSemester(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Semesters</option>
                  <option value="2024-Semester-1">2024 Semester 1</option>
                  <option value="2024-Semester-2">2024 Semester 2</option>
                  <option value="2025-Semester-1">2025 Semester 1</option>
                  <option value="2025-Semester-2">2025 Semester 2</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={fetchFees}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh
                </button>
              </div>
            </div>

            {/* Fee Records Table */}
            <div className="overflow-x-auto">
              {isLoadingFees ? (
                <div className="flex justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <table className="min-w-full bg-white border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Semester
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Billed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total Paid
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Balance
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFees.map((fee) => (
                      <tr key={fee.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {fee.students.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {fee.students.registration_number}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fee.semester}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(fee.total_fee || fee.total_billed || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          {formatCurrency(fee.actual_paid || fee.total_paid || fee.amount_paid || 0)}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${getStatusColor(fee.fee_balance || fee.balance || ((fee.semester_fee || fee.total_fee || fee.total_billed || 0) - (fee.total_paid || fee.amount_paid || 0)))}`}>
                          {formatCurrency(fee.fee_balance || fee.balance || ((fee.total_fee || fee.total_billed || 0) - (fee.total_paid || fee.amount_paid || 0)))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (fee.balance ?? 0) <= 0 
                              ? 'bg-green-100 text-green-800' 
                              : (fee.balance ?? 0) <= 10000 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {getStatusText(fee.fee_balance || fee.balance || ((fee.total_fee || fee.total_billed || 0) - (fee.total_paid || fee.amount_paid || 0)))}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {fee.due_date ? new Date(fee.due_date).toLocaleDateString() : 'No due date'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              
              {!isLoadingFees && filteredFees.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  No fee records found.
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
