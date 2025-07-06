import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-client'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await context.params

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID is required' }, { status: 400 })
    }

    // Get payment details with student information
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('fee_payments')
      .select(`
        *,
        students (
          id,
          registration_number,
          name,
          email,
          phone,
          course,
          year_of_study,
          semester
        )
      `)
      .eq('id', paymentId)
      .single()

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    const student = payment.students

    // Get fee information for context
    const { data: currentFee, error: feeError } = await supabaseAdmin
      .from('fees')
      .select('*')
      .eq('student_id', student.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (feeError) {
      console.error('Error fetching fee information:', feeError)
    }

    // Get payment history for balance calculation
    const { data: allPayments, error: allPaymentsError } = await supabaseAdmin
      .from('fee_payments')
      .select('amount, payment_date')
      .eq('student_id', student.id)
      .order('payment_date', { ascending: false })

    if (allPaymentsError) {
      console.error('Error fetching payment history:', allPaymentsError)
    }

    // Calculate balances
    const totalBilled = currentFee && currentFee.length > 0 
      ? parseFloat(currentFee[0].total_fee.toString()) 
      : 0
    const totalPaid = allPayments?.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0) || 0
    const balance = totalBilled - totalPaid

    // Generate receipt HTML
    const receiptHTML = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Receipt</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .university-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 5px;
        }
        .receipt-title {
            font-size: 18px;
            font-weight: bold;
            color: #333;
            margin-top: 10px;
        }
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .receipt-number {
            font-weight: bold;
            color: #2563eb;
        }
        .student-info, .payment-info {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            margin-bottom: 8px;
        }
        .info-label {
            font-weight: bold;
            min-width: 150px;
            color: #374151;
        }
        .info-value {
            color: #111827;
        }
        .payment-amount {
            font-size: 24px;
            font-weight: bold;
            color: #059669;
            text-align: center;
            padding: 20px;
            border: 2px solid #059669;
            border-radius: 8px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .signature-section {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
        }
        .signature-box {
            border-top: 1px solid #333;
            padding-top: 10px;
            width: 200px;
            text-align: center;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .status-confirmed {
            background-color: #d1fae5;
            color: #065f46;
        }
        .status-pending {
            background-color: #fef3c7;
            color: #92400e;
        }
        @media print {
            body { margin: 0; padding: 10px; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="university-name">CLIPSTECH UNIVERSITY</div>
        <div>P.O. Box 1234, Nairobi, Kenya</div>
        <div>Tel: +254 700 123 456 | Email: finance@clipstech.edu</div>
        <div class="receipt-title">PAYMENT RECEIPT</div>
    </div>

    <div class="receipt-info">
        <div class="receipt-number">Receipt No: ${payment.id}</div>
        <div>Date: ${new Date(payment.payment_date).toLocaleDateString()}</div>
    </div>

    <div class="student-info">
        <h3>Student Information</h3>
        <div class="info-row">
            <span class="info-label">Registration Number:</span>
            <span class="info-value">${student.registration_number}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Name:</span>
            <span class="info-value">${student.name}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Course:</span>
            <span class="info-value">${student.course || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Year of Study:</span>
            <span class="info-value">${student.year_of_study || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Semester:</span>
            <span class="info-value">${student.semester || 'N/A'}</span>
        </div>
    </div>

    <div class="payment-info">
        <h3>Payment Details</h3>
        <div class="info-row">
            <span class="info-label">Payment Method:</span>
            <span class="info-value">${payment.payment_method}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Reference Number:</span>
            <span class="info-value">${payment.reference_number || 'N/A'}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Payment Date:</span>
            <span class="info-value">${new Date(payment.payment_date).toLocaleDateString()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Status:</span>
            <span class="info-value">
                <span class="status-badge ${payment.status === 'confirmed' ? 'status-confirmed' : 'status-pending'}">
                    ${payment.status || 'Confirmed'}
                </span>
            </span>
        </div>
        ${payment.notes ? `
        <div class="info-row">
            <span class="info-label">Notes:</span>
            <span class="info-value">${payment.notes}</span>
        </div>
        ` : ''}
    </div>

    <div class="payment-amount">
        AMOUNT PAID: KES ${parseFloat(payment.amount.toString()).toLocaleString()}
    </div>

    <div class="student-info">
        <h3>Account Summary</h3>
        <div class="info-row">
            <span class="info-label">Total Billed:</span>
            <span class="info-value">KES ${totalBilled.toLocaleString()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Total Paid:</span>
            <span class="info-value">KES ${totalPaid.toLocaleString()}</span>
        </div>
        <div class="info-row">
            <span class="info-label">Balance:</span>
            <span class="info-value">KES ${balance.toLocaleString()}</span>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div>Student Signature</div>
        </div>
        <div class="signature-box">
            <div>Finance Officer</div>
        </div>
    </div>

    <div class="footer">
        <p>This is an official receipt generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p>For inquiries, contact finance@clipstech.edu | +254 700 123 456</p>
        <p>Receipt ID: ${payment.id} | Generated by: Finance System</p>
    </div>
</body>
</html>`

    // Return HTML for browser display or PDF generation
    return new NextResponse(receiptHTML, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="payment-receipt-${payment.id}.html"`
      }
    })

  } catch (error) {
    console.error('Error generating payment receipt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
