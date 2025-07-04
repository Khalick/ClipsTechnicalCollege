-- Create fees and fee_payments tables if they don't exist
-- Run this in your Supabase SQL editor

-- Create fees table
CREATE TABLE IF NOT EXISTS fees (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    semester VARCHAR(20) NOT NULL,
    total_fee DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (total_fee - amount_paid) STORED,
    due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    UNIQUE(student_id, semester)
);

-- Create fee_payments table
CREATE TABLE IF NOT EXISTS fee_payments (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_semester ON fees(semester);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_date ON fee_payments(payment_date);

-- Enable RLS (Row Level Security)
ALTER TABLE fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Students can view own fees" ON fees
    FOR SELECT USING (student_id::text = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage fees" ON fees
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Students can view own payments" ON fee_payments
    FOR SELECT USING (student_id::text = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage payments" ON fee_payments
    FOR ALL USING (auth.role() = 'service_role');

-- Insert sample data for testing
-- (Make sure students with these IDs exist in your database)
INSERT INTO fees (student_id, semester, total_fee, amount_paid, due_date) VALUES
(1, '2024-Semester-1', 150000.00, 45000.00, '2024-08-15'),
(1, '2024-Semester-2', 150000.00, 30000.00, '2024-12-15'),
(2, '2024-Semester-1', 135000.00, 135000.00, '2024-08-15'),
(2, '2024-Semester-2', 135000.00, 85000.00, '2024-12-15'),
(3, '2024-Semester-1', 120000.00, 60000.00, '2024-08-15'),
(3, '2024-Semester-2', 120000.00, 20000.00, '2024-12-15'),
(10, '2024-Semester-1', 56120.00, 42800.00, '2024-08-15'),
(10, '2024-Semester-2', 133200.00, 0.00, '2024-12-15')
ON CONFLICT (student_id, semester) DO UPDATE SET
  total_fee = EXCLUDED.total_fee,
  amount_paid = EXCLUDED.amount_paid,
  due_date = EXCLUDED.due_date,
  updated_at = NOW();

-- Insert sample payment records
INSERT INTO fee_payments (student_id, amount, payment_method, reference_number, notes) VALUES
(1, 25000.00, 'bank_transfer', 'TXN001', 'Initial payment for semester 1'),
(1, 20000.00, 'mpesa', 'MPX002', 'Second payment for semester 1'),
(1, 30000.00, 'cash', 'CSH003', 'Payment for semester 2'),
(2, 135000.00, 'bank_transfer', 'TXN004', 'Full payment for semester 1'),
(2, 85000.00, 'mpesa', 'MPX005', 'Payment for semester 2'),
(3, 60000.00, 'cash', 'CSH006', 'Payment for semester 1'),
(3, 20000.00, 'mpesa', 'MPX007', 'Partial payment for semester 2'),
(10, 25000.00, 'bank_transfer', 'TXN008', 'Payment for semester 1'),
(10, 17800.00, 'mpesa', 'MPX009', 'Second payment for semester 1')
ON CONFLICT DO NOTHING;

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

-- Display the data to verify
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
