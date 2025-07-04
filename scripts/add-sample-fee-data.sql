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

-- Verify the data
SELECT 
    s.name,
    s.registration_number,
    f.semester,
    f.total_fee,
    f.amount_paid,
    f.balance,
    f.due_date
FROM fees f
JOIN students s ON f.student_id = s.id
ORDER BY s.registration_number, f.semester;
