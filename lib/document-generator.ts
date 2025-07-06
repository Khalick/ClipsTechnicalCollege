export const generateExamCard = async (regNumber: string) => {
  try {
    console.log('Generating exam card for:', regNumber)
    
    const response = await fetch(`/api/students/generate-exam-card/${regNumber}`)
    const result = await response.json()
    
    if (!result.success) {
      console.error('Error generating exam card:', result.error)
      throw new Error(result.error || 'Failed to generate exam card')
    }
    
    const { student, units } = result.data
    
    // Validate data
    if (!student || !student.name || !student.registration_number) {
      throw new Error('Invalid student data')
    }
    
    await downloadExamCardPDF(student, units)
    console.log('Exam card generated successfully!')
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

const downloadExamCardPDF = async (studentData: any, units: any[]) => {
  try {
    const response = await fetch('/api/generate-pdf/exam-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentData, units }),
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || 'Failed to generate PDF')
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
    throw error
  }
}

export const generateFeeStatement = async (regNumber: string) => {
  try {
    console.log('Generating fee statement for:', regNumber)
    
    const [studentRes, feeRes] = await Promise.all([
      fetch(`/api/students/profile/${regNumber}`),
      fetch(`/api/students/fees/${regNumber}`)
    ])
    
    const [studentResult, feeResult] = await Promise.all([
      studentRes.json(),
      feeRes.json()
    ])
    
    if (!studentResult.success || !feeResult.success) {
      throw new Error('Student or fee data not found')
    }
    
    // Validate data
    if (!studentResult.data || !feeResult.data) {
      throw new Error('Invalid student or fee data')
    }
    
    await downloadFeeStatementPDF(studentResult.data, feeResult.data)
    console.log('Fee statement generated successfully!')
  } catch (error) {
    console.error('Error:', error)
    throw error
  }
}

const downloadFeeStatementPDF = async (studentData: any, feeData: any) => {
  // For client-side PDF generation, we'll send the data to an API endpoint
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
  } catch (error) {
    console.error('Error generating PDF:', error)
    alert('Error generating PDF')
  }
}

// Enhanced PDF generation utility functions
export const generateExamCardWithValidation = async (regNumber: string): Promise<{success: boolean, error?: string}> => {
  try {
    await generateExamCard(regNumber)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

export const generateFeeStatementWithValidation = async (regNumber: string): Promise<{success: boolean, error?: string}> => {
  try {
    await generateFeeStatement(regNumber)
    return { success: true }
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

// Generate both exam card and fee statement in parallel
export const generateStudentDocuments = async (regNumber: string): Promise<{
  examCard: {success: boolean, error?: string},
  feeStatement: {success: boolean, error?: string}
}> => {
  try {
    const [examCardResult, feeStatementResult] = await Promise.allSettled([
      generateExamCardWithValidation(regNumber),
      generateFeeStatementWithValidation(regNumber)
    ])
    
    return {
      examCard: examCardResult.status === 'fulfilled' ? examCardResult.value : { success: false, error: 'Failed to generate exam card' },
      feeStatement: feeStatementResult.status === 'fulfilled' ? feeStatementResult.value : { success: false, error: 'Failed to generate fee statement' }
    }
  } catch (error) {
    return {
      examCard: { success: false, error: 'System error' },
      feeStatement: { success: false, error: 'System error' }
    }
  }
}

// Validate student data before generating documents
export const validateStudentForDocuments = async (regNumber: string): Promise<{
  isValid: boolean,
  hasStudentData: boolean,
  hasFeeData: boolean,
  hasUnits: boolean,
  message?: string
}> => {
  try {
    const [studentRes, feeRes, examCardRes] = await Promise.all([
      fetch(`/api/students/profile/${regNumber}`),
      fetch(`/api/students/fees/${regNumber}`),
      fetch(`/api/students/generate-exam-card/${regNumber}`)
    ])
    
    const [studentResult, feeResult, examCardResult] = await Promise.all([
      studentRes.json(),
      feeRes.json(),
      examCardRes.json()
    ])
    
    const hasStudentData = studentResult.success && studentResult.data
    const hasFeeData = feeResult.success && feeResult.data
    const hasUnits = examCardResult.success && examCardResult.data?.units?.length > 0
    
    return {
      isValid: hasStudentData && hasFeeData,
      hasStudentData,
      hasFeeData,
      hasUnits,
      message: !hasStudentData ? 'Student not found' : 
               !hasFeeData ? 'No fee data available' : 
               !hasUnits ? 'No units registered' : undefined
    }
  } catch (error) {
    return {
      isValid: false,
      hasStudentData: false,
      hasFeeData: false,
      hasUnits: false,
      message: 'Error validating student data'
    }
  }
}