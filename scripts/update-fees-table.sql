-- Update fees table to add unique constraint for student_id and semester
-- This prevents duplicate fee records for the same student and semester

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'unique_student_semester' 
        AND table_name = 'fees'
    ) THEN
        ALTER TABLE fees ADD CONSTRAINT unique_student_semester UNIQUE (student_id, semester);
    END IF;
END $$;

-- Create or update indexes for better performance
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_semester ON fees(semester);
CREATE INDEX IF NOT EXISTS idx_fee_payments_student_id ON fee_payments(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_payments_date ON fee_payments(payment_date);

-- Display current fee structure
SELECT 
    'fees' as table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'fees' 
ORDER BY ordinal_position;
