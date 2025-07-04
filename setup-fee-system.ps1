# Setup Fee Management System
# This script sets up the database with sample data for testing the fee management system

Write-Host "Setting up Fee Management System..." -ForegroundColor Green

# Check if Supabase is configured
if (-not (Test-Path ".env.local")) {
    Write-Host "Warning: .env.local file not found. Make sure Supabase is configured." -ForegroundColor Yellow
}

# Apply the sample fee data
Write-Host "Adding sample fee data..." -ForegroundColor Blue

# You can run this SQL in your Supabase dashboard or via CLI
$sqlContent = @"
-- Sample fee data for testing
-- Make sure you have students in your database first

-- Insert sample fee records
INSERT INTO fees (student_id, semester, total_fee, amount_paid, due_date) VALUES
(1, '2024-Semester-1', 150000.00, 45000.00, '2024-08-15'),
(1, '2024-Semester-2', 150000.00, 30000.00, '2024-12-15'),
(2, '2024-Semester-1', 135000.00, 135000.00, '2024-08-15'),
(2, '2024-Semester-2', 135000.00, 85000.00, '2024-12-15'),
(3, '2024-Semester-1', 120000.00, 60000.00, '2024-08-15'),
(3, '2024-Semester-2', 120000.00, 20000.00, '2024-12-15')
ON CONFLICT (student_id, semester) DO UPDATE SET
  total_fee = EXCLUDED.total_fee,
  amount_paid = EXCLUDED.amount_paid,
  due_date = EXCLUDED.due_date,
  updated_at = CURRENT_TIMESTAMP;

-- Insert sample payment records
INSERT INTO fee_payments (student_id, amount, payment_method, reference_number, notes) VALUES
(1, 25000.00, 'bank_transfer', 'TXN001', 'Initial payment for semester 1'),
(1, 20000.00, 'mpesa', 'MPX002', 'Second payment for semester 1'),
(1, 30000.00, 'cash', 'CSH003', 'Payment for semester 2'),
(2, 135000.00, 'bank_transfer', 'TXN004', 'Full payment for semester 1'),
(2, 85000.00, 'mpesa', 'MPX005', 'Payment for semester 2'),
(3, 60000.00, 'cash', 'CSH006', 'Payment for semester 1'),
(3, 20000.00, 'mpesa', 'MPX007', 'Partial payment for semester 2');

-- Update amount_paid in fees table to match payment totals
UPDATE fees 
SET amount_paid = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM fee_payments 
    WHERE fee_payments.student_id = fees.student_id
)
WHERE EXISTS (
    SELECT 1 FROM fee_payments 
    WHERE fee_payments.student_id = fees.student_id
);
"@

Write-Host "SQL to execute in Supabase:" -ForegroundColor Cyan
Write-Host $sqlContent -ForegroundColor Gray

Write-Host "`nTo complete the setup:" -ForegroundColor Green
Write-Host "1. Copy the SQL above and run it in your Supabase SQL editor" -ForegroundColor White
Write-Host "2. Make sure you have students with IDs 1, 2, 3 in your database" -ForegroundColor White
Write-Host "3. Start the development server: npm run dev" -ForegroundColor White
Write-Host "4. Login as a student to see real fee data" -ForegroundColor White

Write-Host "`nAPI Endpoints created:" -ForegroundColor Green
Write-Host "- GET /api/students/fees/[regNumber] - Fetch student fees" -ForegroundColor White
Write-Host "- POST /api/finance/record-payment - Record a payment" -ForegroundColor White
Write-Host "- GET/POST /api/admin/fees - Admin fee management" -ForegroundColor White

Write-Host "`nFee Management System setup complete!" -ForegroundColor Green
