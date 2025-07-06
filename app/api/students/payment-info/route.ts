import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Payment methods configuration
    const paymentMethods = [
      {
        id: 'cash',
        name: 'Cash',
        description: 'Pay in cash at the finance office',
        icon: 'banknote',
        enabled: true,
        requires_reference: false,
        office_hours: 'Monday - Friday, 8:00 AM - 5:00 PM',
        location: 'Finance Office, Ground Floor'
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Transfer to university bank account',
        icon: 'building-bank',
        enabled: true,
        requires_reference: true,
        bank_details: {
          bank_name: 'KCB Bank',
          account_name: 'ClipsTech University',
          account_number: '1234567890',
          branch: 'Nairobi Branch',
          swift_code: 'KCBLKENX'
        }
      },
      {
        id: 'mpesa',
        name: 'M-Pesa',
        description: 'Pay via M-Pesa mobile money',
        icon: 'smartphone',
        enabled: true,
        requires_reference: true,
        paybill_details: {
          paybill_number: '400200',
          account_number: 'Your Registration Number',
          instructions: 'Go to M-Pesa menu > Lipa na M-Pesa > Pay Bill > Enter Paybill Number'
        }
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay using your card online',
        icon: 'credit-card',
        enabled: false, // Disabled for now
        requires_reference: false,
        note: 'Online card payments coming soon'
      },
      {
        id: 'cheque',
        name: 'Cheque',
        description: 'Pay by cheque at the finance office',
        icon: 'file-text',
        enabled: true,
        requires_reference: false,
        instructions: 'Make cheque payable to "ClipsTech University"',
        office_hours: 'Monday - Friday, 8:00 AM - 5:00 PM'
      }
    ]

    // Payment configuration
    const paymentConfig = {
      minimum_payment: 1000, // Minimum payment amount in currency
      maximum_payment: 500000, // Maximum payment amount in currency
      currency: 'KES',
      currency_symbol: 'KES',
      payment_deadline_days: 30, // Days from fee creation
      exam_card_threshold: 60, // Percentage of fees that must be paid to access exam card
      late_payment_penalty: 0.05, // 5% penalty for late payments
      installment_allowed: true,
      minimum_installment: 5000,
      payment_reminders: {
        first_reminder: 7, // Days before deadline
        second_reminder: 3, // Days before deadline
        final_reminder: 1 // Days before deadline
      }
    }

    // Fee structure information
    const feeStructure = {
      tuition_fee: {
        name: 'Tuition Fee',
        description: 'Main academic fee',
        mandatory: true
      },
      exam_fee: {
        name: 'Examination Fee',
        description: 'Fee for examinations',
        mandatory: true
      },
      library_fee: {
        name: 'Library Fee',
        description: 'Access to library resources',
        mandatory: true
      },
      lab_fee: {
        name: 'Laboratory Fee',
        description: 'Use of laboratory facilities',
        mandatory: false
      },
      activity_fee: {
        name: 'Activity Fee',
        description: 'Student activities and clubs',
        mandatory: false
      }
    }

    // Contact information
    const contactInfo = {
      finance_office: {
        phone: '+254 700 123 456',
        email: 'finance@clipstech.edu',
        location: 'Ground Floor, Administration Block',
        office_hours: 'Monday - Friday: 8:00 AM - 5:00 PM'
      },
      support: {
        phone: '+254 700 123 457',
        email: 'support@clipstech.edu',
        whatsapp: '+254 700 123 458'
      }
    }

    // Important notices
    const notices = [
      {
        type: 'info',
        title: 'Payment Processing Time',
        message: 'All payments are processed within 24 hours. Please keep your receipt.'
      },
      {
        type: 'warning',
        title: 'Late Payment Penalty',
        message: 'A 5% penalty applies to payments made after the deadline.'
      },
      {
        type: 'success',
        title: 'Exam Card Access',
        message: 'Pay at least 60% of your fees to access your exam card.'
      }
    ]

    const paymentInfo = {
      payment_methods: paymentMethods,
      payment_config: paymentConfig,
      fee_structure: feeStructure,
      contact_info: contactInfo,
      notices: notices,
      last_updated: new Date().toISOString()
    }

    return NextResponse.json({ success: true, data: paymentInfo })
  } catch (error) {
    console.error('Error in payment info API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
