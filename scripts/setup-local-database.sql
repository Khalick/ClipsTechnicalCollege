-- Create database (run this as postgres superuser)
-- psql -U postgres -c "CREATE DATABASE clips_college;"

-- Connect to the clips_college database and run the rest
-- psql -U postgres -d clips_college -f scripts/setup-local-database.sql

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'admin',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create units table
CREATE TABLE IF NOT EXISTS units (
    id SERIAL PRIMARY KEY,
    unit_name VARCHAR(100) NOT NULL,
    unit_code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create student_documents table
CREATE TABLE IF NOT EXISTS student_documents (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) NOT NULL,
    document_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_number) REFERENCES students(registration_number) ON DELETE CASCADE
);

-- Create student_units table for unit registration
CREATE TABLE IF NOT EXISTS student_units (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    unit_id INTEGER NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'registered',
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE,
    UNIQUE(student_id, unit_id)
);

-- Create fees table for fee management
CREATE TABLE IF NOT EXISTS fees (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    semester VARCHAR(20) NOT NULL,
    total_fee DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    balance DECIMAL(10,2) GENERATED ALWAYS AS (total_fee - amount_paid) STORED,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create fee_payments table for payment tracking
CREATE TABLE IF NOT EXISTS fee_payments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    payment_method VARCHAR(50),
    reference_number VARCHAR(100),
    notes TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
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

-- Insert default admin users
INSERT INTO admins (username, password_hash, email, full_name, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@clipstech.edu', 'System Administrator', 'admin'),
('clips_admin', '$2a$10$7Z8QZ8QZ8QZ8QZ8QZ8QZ8O8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8', 'clips.admin@clipstech.edu', 'CLIPS Administrator', 'admin')
ON CONFLICT (username) DO NOTHING;

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

-- Insert sample student
INSERT INTO students (name, registration_number, course, level_of_study, email, password) VALUES
('John Doe', 'CS/001/2024', 'Computer Science', 'Year 2 Semester 1', 'john.doe@student.clips.edu', 'password123'),
('Jane Smith', 'CS/002/2024', 'Computer Science', 'Year 1 Semester 2', 'jane.smith@student.clips.edu', 'password123'),
('Mike Johnson', 'IT/001/2024', 'Information Technology', 'Year 3 Semester 1', 'mike.johnson@student.clips.edu', 'password123')
ON CONFLICT (registration_number) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_students_registration_number ON students(registration_number);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_student_documents_registration ON student_documents(registration_number);
CREATE INDEX IF NOT EXISTS idx_student_units_student_id ON student_units(student_id);
CREATE INDEX IF NOT EXISTS idx_fees_student_id ON fees(student_id);

-- Display summary
SELECT 'Database setup completed successfully!' as message;
SELECT 'Admin users created:' as info;
SELECT username, email, full_name FROM admins;
SELECT 'Sample students created:' as info;
SELECT name, registration_number, course FROM students;
SELECT 'Units available:' as info;
SELECT unit_name, unit_code FROM units;
