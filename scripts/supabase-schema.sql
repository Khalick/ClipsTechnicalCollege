-- Enable Row Level Security
ALTER TABLE IF EXISTS admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS students ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS student_unit_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS fee_payments ENABLE ROW LEVEL SECURITY;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    course VARCHAR(100) NOT NULL,
    level_of_study VARCHAR(50) NOT NULL,
    national_id VARCHAR(20),
    birth_certificate VARCHAR(50),
    date_of_birth DATE,
    email VARCHAR(100),
    password VARCHAR(255),
    photo_url TEXT,
    status VARCHAR(20) DEFAULT 'active',
    deregistered BOOLEAN DEFAULT false,
    deregistration_date DATE,
    deregistration_reason TEXT,
    academic_leave BOOLEAN DEFAULT false,
    academic_leave_start DATE,
    academic_leave_end DATE,
    academic_leave_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
    id BIGSERIAL PRIMARY KEY,
    unit_name VARCHAR(100) NOT NULL,
    unit_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create student_documents table
CREATE TABLE IF NOT EXISTS student_documents (
    id BIGSERIAL PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (registration_number) REFERENCES students(registration_number) ON DELETE CASCADE
);

-- Create student_units table for unit registration
CREATE TABLE IF NOT EXISTS student_units (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'registered',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    UNIQUE(student_id, unit_id)
);

-- Create student_unit_allocations table for unit allocation by admin
CREATE TABLE IF NOT EXISTS student_unit_allocations (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT NOT NULL,
    unit_id BIGINT NOT NULL,
    allocated_by VARCHAR(50) DEFAULT 'admin',
    allocated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'allocated',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    UNIQUE(student_id, unit_id)
);

-- Create fees table for fee management
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
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create fee_payments table for payment tracking
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_students_updated_at ON students;
CREATE TRIGGER update_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_fees_updated_at ON fees;
CREATE TRIGGER update_fees_updated_at
    BEFORE UPDATE ON fees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin users (passwords are hashed)
-- admin password: admin123
-- clips_admin password: clips2024
INSERT INTO admins (username, password_hash, email, full_name, role) VALUES
('admin', '$2b$10$ndgbNfOHtPKeQCWlLueN5.d1c/21DCNzmeT8wJuaEp6fSnFYff7dG', 'admin@clipstech.edu', 'System Administrator', 'admin'),
('clips_admin', '$2b$10$x8UDR6uAZ/hVXz7aBfyrhuSDICjmzMnmqHDBLeBh7oea9FiXi1Pvi', 'clips.admin@clipstech.edu', 'CLIPS Administrator', 'admin')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Insert sample units
INSERT INTO units (unit_name, unit_code, description, credits) VALUES
('Programming Fundamentals', 'CS101', 'Introduction to programming concepts and logic', 3),
('Database Systems', 'CS201', 'Database design and management systems', 4),
('Web Development', 'CS301', 'Frontend and backend web development', 3),
('Mobile App Development', 'CS302', 'Android and iOS application development', 3),
('Data Structures', 'CS202', 'Data structures and algorithms', 4),
('Computer Networks', 'CS401', 'Network protocols and administration', 3),
('Software Engineering', 'CS402', 'Software development methodologies', 4),
('Cybersecurity', 'CS501', 'Information security and ethical hacking', 3)
ON CONFLICT (unit_code) DO NOTHING;

-- Insert sample students
INSERT INTO students (name, registration_number, course, level_of_study, email, national_id, birth_certificate, date_of_birth) VALUES
('John Doe', 'CS/001/2024', 'Computer Science', 'Year 2 Semester 1', 'john.doe@student.clips.edu', '12345678', 'BC123456', '1995-01-01'),
('Jane Smith', 'CS/002/2024', 'Computer Science', 'Year 1 Semester 2', 'jane.smith@student.clips.edu', '87654321', 'BC789012', '1996-06-15'),
('Mike Johnson', 'IT/001/2024', 'Information Technology', 'Year 3 Semester 1', 'mike.johnson@student.clips.edu', '11223344', 'BC345678', '1994-03-10'),
('Emily Davis', 'CS/003/2024', 'Computer Science', 'Year 1 Semester 1', 'emily.davis@student.clips.edu', null, 'BC901234', '2007-09-20'),
('Alex Wilson', 'IT/002/2024', 'Information Technology', 'Year 2 Semester 1', 'alex.wilson@student.clips.edu', null, 'BC567890', '2006-12-05')
ON CONFLICT (registration_number) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_registration_number ON students(registration_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_student_documents_registration ON student_documents(registration_number);
CREATE INDEX IF NOT EXISTS idx_student_units_student_id ON student_units(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON fees(student_id);

-- RLS Policies for security

-- Admins table - only service role can access
CREATE POLICY "Service role can manage admins" ON admins
    FOR ALL USING (auth.role() = 'service_role');

-- Students table - students can read their own data, service role can manage all
CREATE POLICY "Students can view own data" ON students
    FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage students" ON students
    FOR ALL USING (auth.role() = 'service_role');

-- Units table - readable by all authenticated users
CREATE POLICY "Authenticated users can view units" ON units
    FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage units" ON units
    FOR ALL USING (auth.role() = 'service_role');

-- Student documents - students can view their own, service role can manage all
CREATE POLICY "Students can view own documents" ON student_documents
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM students 
            WHERE students.registration_number = student_documents.registration_number 
            AND students.id::text = auth.uid()::text
        ) OR auth.role() = 'service_role'
    );

CREATE POLICY "Service role can manage documents" ON student_documents
    FOR ALL USING (auth.role() = 'service_role');

-- Student units - students can view their own, service role can manage all
CREATE POLICY "Students can view own units" ON student_units
    FOR SELECT USING (student_id::text = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage student units" ON student_units
    FOR ALL USING (auth.role() = 'service_role');

-- Student unit allocations - students can view their own, service role can manage all
CREATE POLICY "Students can view own allocations" ON student_unit_allocations
    FOR SELECT USING (student_id::text = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage allocations" ON student_unit_allocations
    FOR ALL USING (auth.role() = 'service_role');

-- Fees - students can view their own, service role can manage all
CREATE POLICY "Students can view own fees" ON fees
    FOR SELECT USING (student_id::text = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage fees" ON fees
    FOR ALL USING (auth.role() = 'service_role');

-- Fee payments - students can view their own, service role can manage all
CREATE POLICY "Students can view own payments" ON fee_payments
    FOR SELECT USING (student_id::text = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage payments" ON fee_payments
    FOR ALL USING (auth.role() = 'service_role');
