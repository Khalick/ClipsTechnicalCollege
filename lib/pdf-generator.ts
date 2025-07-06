import puppeteer, { Browser } from 'puppeteer'

export class PDFGenerator {
  private static browser: Browser | null = null

  static async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      try {
        this.browser = await puppeteer.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox']
        })
      } catch (error) {
        console.error('Error launching browser:', error)
        // Try to install Chrome if it's not found
        if (error instanceof Error && error.message.includes('Could not find Chrome')) {
          console.log('Chrome not found. Attempting to install...')
          throw new Error('Chrome browser not found. Please run: npx puppeteer browsers install chrome')
        }
        throw error
      }
    }
    return this.browser
  }

  static async generatePDF(html: string, options: {
    format?: 'A4' | 'Letter',
    margin?: { top: string, right: string, bottom: string, left: string }
  } = {}): Promise<Buffer> {
    const browser = await this.getBrowser()
    const page = await browser.newPage()
    
    try {
      await page.setContent(html, { waitUntil: 'networkidle0' })
      
      const pdf = await page.pdf({
        format: options.format || 'A4',
        printBackground: true,
        margin: options.margin || {
          top: '20px',
          right: '20px',
          bottom: '20px',
          left: '20px'
        }
      })
      
      return Buffer.from(pdf)
    } finally {
      await page.close()
    }
  }

  static async generateExamCardPDF(studentData: any, units: any[]): Promise<Buffer> {
    const html = this.generateExamCardHTML(studentData, units)
    return this.generatePDF(html)
  }

  static async generateFeeStatementPDF(studentData: any, feeData: any): Promise<Buffer> {
    const html = this.generateFeeStatementHTML(studentData, feeData)
    return this.generatePDF(html)
  }

  static generateExamCardHTML(studentData: any, units: any[]): string {
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

  static generateFeeStatementHTML(studentData: any, feeData: any): string {
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

  static async closeBrowser(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
    }
  }
}

// Helper function to format currency
export function formatCurrency(amount: number): string {
  return `KSh ${amount.toLocaleString()}`
}

// Helper function to format date
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
