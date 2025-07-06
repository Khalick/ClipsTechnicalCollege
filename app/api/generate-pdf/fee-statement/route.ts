import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer'

export async function POST(request: NextRequest) {
  try {
    const { studentData, feeData } = await request.json()
    
    // Validate input data
    if (!studentData || !studentData.name || !studentData.registration_number) {
      return NextResponse.json(
        { error: 'Invalid student data provided' }, 
        { status: 400 }
      )
    }
    
    if (!feeData) {
      return NextResponse.json(
        { error: 'Invalid fee data provided' }, 
        { status: 400 }
      )
    }
    
    console.log('Generating fee statement PDF for:', studentData.registration_number)
    
    const html = generateFeeStatementHTML(studentData, feeData)
    
    // Launch puppeteer in headless mode
    let browser
    try {
      browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      })
    } catch (error) {
      console.error('Error launching browser:', error)
      if (error instanceof Error && error.message.includes('Could not find Chrome')) {
        return NextResponse.json(
          { error: 'Chrome browser not found. Please run: npx puppeteer browsers install chrome' }, 
          { status: 500 }
        )
      }
      throw error
    }
    
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    
    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    })
    
    await browser.close()
    
    console.log('Fee statement PDF generated successfully')
    
    return new NextResponse(pdf as any, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename=fee-statement-${studentData.registration_number}.pdf`,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error generating fee statement PDF:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF: ' + (error instanceof Error ? error.message : 'Unknown error') }, 
      { status: 500 }
    )
  }
}

function generateFeeStatementHTML(studentData: any, feeData: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Fee Statement - ${studentData.name}</title>
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
          grid-template-columns: 1fr 1fr; 
          gap: 20px; 
          margin-bottom: 20px; 
        }
        .section { 
          margin-bottom: 20px; 
        }
        .section h3 { 
          font-size: 16px; 
          font-weight: bold; 
          border-bottom: 1px solid #ccc; 
          padding-bottom: 5px; 
          margin-bottom: 10px; 
        }
        .info-table { 
          width: 100%; 
          border-collapse: collapse;
        }
        .info-table td { 
          padding: 5px 0; 
          border-bottom: 1px solid #eee; 
        }
        .label { 
          font-weight: bold; 
          width: 50%; 
        }
        .data-table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 15px; 
        }
        .data-table th, .data-table td { 
          border: 1px solid #ccc; 
          padding: 8px; 
          text-align: left; 
        }
        .data-table th { 
          background-color: #f0f0f0; 
          font-weight: bold; 
        }
        .positive { 
          color: #059669; 
          font-weight: bold; 
        }
        .negative { 
          color: #dc2626; 
          font-weight: bold; 
        }
        .footer { 
          text-align: center; 
          border-top: 2px solid #000; 
          padding-top: 10px; 
          font-size: 12px; 
          margin-top: 20px; 
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="title">CLIPS TECHNICAL COLLEGE</div>
        <div class="subtitle">FEE STATEMENT</div>
        <div>Generated on: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>
      </div>
      
      <div class="info-grid">
        <div class="section">
          <h3>STUDENT INFORMATION</h3>
          <table class="info-table">
            <tr><td class="label">Name:</td><td>${studentData.name}</td></tr>
            <tr><td class="label">Registration Number:</td><td>${studentData.registration_number}</td></tr>
            <tr><td class="label">Course:</td><td>${studentData.course}</td></tr>
            <tr><td class="label">Level:</td><td>${studentData.level_of_study}</td></tr>
          </table>
        </div>
        <div class="section">
          <h3>FEE SUMMARY</h3>
          <table class="info-table">
            <tr><td class="label">Total Billed:</td><td>KSh ${feeData.semester_fee?.toLocaleString() || '0'}</td></tr>
            <tr><td class="label">Total Paid:</td><td class="positive">KSh ${feeData.total_paid?.toLocaleString() || '0'}</td></tr>
            <tr><td class="label">Outstanding Balance:</td><td class="${feeData.fee_balance > 0 ? 'negative' : 'positive'}">KSh ${feeData.fee_balance?.toLocaleString() || '0'}</td></tr>
            <tr><td class="label">Payment Progress:</td><td>${feeData.session_progress || '0'}%</td></tr>
          </table>
        </div>
      </div>
      
      <div class="section">
        <h3>FEE BREAKDOWN BY SEMESTER</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Semester</th>
              <th>Total Fee</th>
              <th>Amount Paid</th>
              <th>Balance</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${feeData.fees?.length > 0 ? feeData.fees.map((fee: any) => `
              <tr>
                <td>${fee.semester}</td>
                <td>KSh ${fee.total_fee?.toLocaleString() || '0'}</td>
                <td class="positive">KSh ${fee.amount_paid?.toLocaleString() || '0'}</td>
                <td class="${fee.balance > 0 ? 'negative' : 'positive'}">KSh ${fee.balance?.toLocaleString() || '0'}</td>
                <td>${fee.balance <= 0 ? 'PAID' : 'PENDING'}</td>
              </tr>
            `).join('') : '<tr><td colspan="5">No fee records found</td></tr>'}
          </tbody>
        </table>
      </div>
      
      <div class="section">
        <h3>PAYMENT HISTORY</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
              <th>Payment Method</th>
              <th>Reference</th>
            </tr>
          </thead>
          <tbody>
            ${feeData.payments?.length > 0 ? feeData.payments.map((payment: any) => `
              <tr>
                <td>${new Date(payment.date).toLocaleDateString()}</td>
                <td>${payment.description || 'Fee Payment'}</td>
                <td class="positive">KSh ${payment.amount?.toLocaleString() || '0'}</td>
                <td>${payment.method || 'N/A'}</td>
                <td>${payment.reference || 'N/A'}</td>
              </tr>
            `).join('') : '<tr><td colspan="5">No payment records found</td></tr>'}
          </tbody>
        </table>
      </div>
      
      <div class="footer">
        <p>This fee statement is valid only for the current academic session.</p>
        <p>For inquiries, contact finance@clipstech.edu | +254 700 123 456</p>
        <p>Generated on: ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })} | Authorized by: Finance Department</p>
      </div>
    </body>
    </html>
  `
}
