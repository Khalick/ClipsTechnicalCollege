import { NextRequest, NextResponse } from 'next/server'
import { PDFGenerator } from '@/lib/pdf-generator'

export async function POST(request: NextRequest) {
  try {
    const { studentData, units } = await request.json()
    
    // Validate input data
    if (!studentData || !studentData.name || !studentData.registration_number) {
      return NextResponse.json(
        { error: 'Invalid student data provided' }, 
        { status: 400 }
      )
    }
    
    if (!units || !Array.isArray(units)) {
      return NextResponse.json(
        { error: 'Invalid units data provided' }, 
        { status: 400 }
      )
    }
    
    console.log('Generating exam card PDF for:', studentData.registration_number)
    
    let pdf
    try {
      pdf = await PDFGenerator.generateExamCardPDF(studentData, units)
    } catch (error) {
      console.error('Error generating PDF:', error)
      if (error instanceof Error && error.message.includes('Chrome browser not found')) {
        return NextResponse.json(
          { error: 'Chrome browser not found. Please run: npx puppeteer browsers install chrome' }, 
          { status: 500 }
        )
      }
      throw error
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
    console.error('Error generating exam card PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}

function generateExamCardHTML(studentData: any, units: any[]) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Exam Card - ${studentData.name}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          font-size: 14px; 
        }
        .header { 
          text-align: center; 
          border-bottom: 2px solid #000; 
          padding-bottom: 15px; 
          margin-bottom: 20px; 
        }
        .title { 
          font-size: 24px; 
          font-weight: bold; 
          color: #2563eb; 
          margin-bottom: 5px; 
        }
        .subtitle { 
          font-size: 18px; 
          font-weight: 600; 
          margin-bottom: 5px; 
        }
        .info-grid { 
          display: grid; 
          grid-template-columns: 2fr 1fr; 
          gap: 20px; 
          margin-bottom: 20px; 
        }
        .info-table { 
          width: 100%; 
          border-collapse: collapse;
        }
        .info-table td { 
          padding: 8px 0; 
          border-bottom: 1px solid #ccc; 
        }
        .label { 
          font-weight: bold; 
          width: 40%; 
        }
        .photo-box { 
          width: 120px; 
          height: 150px; 
          border: 2px dashed #666; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin: 0 auto; 
          font-size: 12px;
          color: #666;
        }
        .units-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 20px; 
        }
        .units-table th, .units-table td { 
          border: 1px solid #000; 
          padding: 8px; 
          text-align: left; 
        }
        .units-table th { 
          background-color: #f0f0f0; 
          font-weight: bold; 
        }
        .signature-section { 
          display: grid; 
          grid-template-columns: 1fr 1fr; 
          gap: 30px; 
          margin-bottom: 20px; 
        }
        .signature-box { 
          border-top: 2px solid #000; 
          padding-top: 10px; 
          margin-top: 40px; 
          font-size: 12px;
        }
        .footer { 
          text-align: center; 
          border-top: 2px solid #000; 
          padding-top: 10px; 
          font-size: 12px; 
        }
        h3 { 
          margin: 0 0 10px 0; 
          font-size: 16px; 
        }
        h4 { 
          margin: 0 0 10px 0; 
          font-size: 14px; 
        }
        p { 
          margin: 5px 0; 
          font-size: 12px; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">CLIPS TECHNICAL COLLEGE</div>
        <div class="subtitle">EXAMINATION CARD</div>
        <div>Academic Year: ${new Date().getFullYear()}</div>
      </div>
      
      <div class="info-grid">
        <div>
          <h3>STUDENT INFORMATION</h3>
          <table class="info-table">
            <tr><td class="label">Name:</td><td>${studentData.name}</td></tr>
            <tr><td class="label">Registration No:</td><td>${studentData.registration_number}</td></tr>
            <tr><td class="label">Course:</td><td>${studentData.course}</td></tr>
            <tr><td class="label">Level:</td><td>${studentData.level_of_study}</td></tr>
          </table>
        </div>
        <div>
          <div class="photo-box">STUDENT PHOTO</div>
        </div>
      </div>
      
      <h3>REGISTERED UNITS</h3>
      <table class="units-table">
        <thead>
          <tr>
            <th>S/No</th>
            <th>Unit Code</th>
            <th>Unit Name</th>
            <th>Signature</th>
          </tr>
        </thead>
        <tbody>
          ${units.map((unit, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${unit.code}</td>
              <td>${unit.name}</td>
              <td style="height: 30px;"></td>
            </tr>
          `).join('')}
          ${Array.from({ length: Math.max(0, 8 - units.length) }).map((_, index) => `
            <tr>
              <td>${units.length + index + 1}</td>
              <td></td>
              <td></td>
              <td style="height: 30px;"></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <div class="signature-section">
        <div>
          <h4>STUDENT DECLARATION</h4>
          <p>I declare that the information provided above is correct and I understand the examination rules and regulations.</p>
          <div class="signature-box">Student Signature & Date</div>
        </div>
        <div>
          <h4>INVIGILATOR VERIFICATION</h4>
          <p>I have verified the student's identity and confirmed their eligibility to sit for the examination.</p>
          <div class="signature-box">Invigilator Signature & Date</div>
        </div>
      </div>
      
      <div class="footer">
        <p>This exam card is valid only for the current academic session and must be presented during all examinations.</p>
        <p>Generated on: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
      </div>
    </body>
    </html>
  `
}
