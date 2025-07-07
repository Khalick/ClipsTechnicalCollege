import { NextRequest, NextResponse } from 'next/server'
import { PDFGenerator } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { studentData, units } = await request.json()
    
    // Validate input data
    if (!studentData || !studentData.name || !studentData.registration_number) {
      return NextResponse.json(
        { error: 'Invalid student data provided. Make sure all required fields are filled.' }, 
        { status: 400 }
      )
    }
    
    if (!units || !Array.isArray(units)) {
      return NextResponse.json(
        { error: 'Invalid units data provided. Units should be an array.' }, 
        { status: 400 }
      )
    }
    
    console.log('Generating exam card PDF for:', studentData.registration_number)
    
    let pdf
    try {
      pdf = await PDFGenerator.generateExamCardPDF(studentData, units)
    } catch (error) {
      console.error('Error generating PDF:', error)
      // Specific error for missing Chrome (Puppeteer)
      if (error instanceof Error && error.message.includes('Chrome browser not found')) {
        return NextResponse.json(
          { error: 'Chrome browser not found on server. Please run: npx puppeteer browsers install chrome' }, 
          { status: 500 }
        )
      }
      // Generic error
      return NextResponse.json(
        { error: `Failed to generate PDF (server error): ${error instanceof Error ? error.message : 'Unknown error'}` },
        { status: 500 }
      )
    }
    
    console.log('Exam card PDF generated successfully')
    
    return new NextResponse(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=exam-card-${studentData.registration_number}.pdf`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error handling exam card API request:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}
