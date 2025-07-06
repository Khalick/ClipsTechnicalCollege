-- Enhanced Clearance System Database Schema
-- This script creates the necessary tables for the student clearance system

-- Create clearance_records table
CREATE TABLE IF NOT EXISTS clearance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    department_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    cleared_by VARCHAR(100),
    cleared_date TIMESTAMP,
    notes TEXT,
    requirements TEXT[] DEFAULT '{}',
    pending_requirements TEXT[] DEFAULT '{}',
    progress_percentage INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clearance_requests table
CREATE TABLE IF NOT EXISTS clearance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(20) NOT NULL,
    request_type VARCHAR(50) NOT NULL,
    request_reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    priority VARCHAR(20) NOT NULL DEFAULT 'normal',
    requested_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_date TIMESTAMP,
    approved_by VARCHAR(100),
    notes TEXT,
    documents_required TEXT[] DEFAULT '{}',
    documents_submitted TEXT[] DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clearance_departments table (master data)
CREATE TABLE IF NOT EXISTS clearance_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    department_type VARCHAR(50) NOT NULL,
    description TEXT,
    contact_person VARCHAR(100),
    contact_email VARCHAR(100),
    contact_phone VARCHAR(20),
    office_location VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clearance_requirements table (master data)
CREATE TABLE IF NOT EXISTS clearance_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES clearance_departments(id),
    requirement_name VARCHAR(200) NOT NULL,
    requirement_description TEXT,
    is_mandatory BOOLEAN DEFAULT true,
    documents_needed TEXT[] DEFAULT '{}',
    estimated_processing_days INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample departments
INSERT INTO clearance_departments (name, department_type, description, contact_person, contact_email, contact_phone, office_location) VALUES
('Library', 'academic', 'Library clearance for book returns and fine payments', 'Jane Librarian', 'library@clipstech.edu', '+254700000001', 'Library Building, Ground Floor'),
('Finance', 'administrative', 'Financial clearance for fee payments and refunds', 'John Finance', 'finance@clipstech.edu', '+254700000002', 'Administration Block, Room 102'),
('IT Department', 'technical', 'IT clearance for equipment returns and account deactivation', 'Bob IT', 'it@clipstech.edu', '+254700000003', 'IT Building, Room 201'),
('Academic Office', 'academic', 'Academic clearance for coursework and evaluation completion', 'Alice Academic', 'academic@clipstech.edu', '+254700000004', 'Academic Block, Room 301'),
('Student Affairs', 'administrative', 'Student affairs clearance for disciplinary and social matters', 'Carol Student', 'studentaffairs@clipstech.edu', '+254700000005', 'Student Center, Room 101'),
('Security', 'administrative', 'Security clearance for ID card returns and access control', 'Dave Security', 'security@clipstech.edu', '+254700000006', 'Security Office, Main Gate'),
('Hostel', 'accommodation', 'Hostel clearance for accommodation and property matters', 'Eve Hostel', 'hostel@clipstech.edu', '+254700000007', 'Hostel Block A, Ground Floor'),
('Health Center', 'medical', 'Health clearance for medical records and examinations', 'Frank Health', 'health@clipstech.edu', '+254700000008', 'Health Center Building');

-- Insert sample requirements for each department
INSERT INTO clearance_requirements (department_id, requirement_name, requirement_description, is_mandatory, documents_needed, estimated_processing_days) VALUES
-- Library requirements
((SELECT id FROM clearance_departments WHERE name = 'Library'), 'Return all borrowed books', 'All borrowed books must be returned to the library', true, '{"Library card", "Book return receipt"}', 1),
((SELECT id FROM clearance_departments WHERE name = 'Library'), 'Pay outstanding library fines', 'All outstanding library fines must be cleared', true, '{"Payment receipt", "Fine clearance form"}', 2),
((SELECT id FROM clearance_departments WHERE name = 'Library'), 'Complete library exit survey', 'Fill out the library exit survey form', false, '{"Exit survey form"}', 1),

-- Finance requirements
((SELECT id FROM clearance_departments WHERE name = 'Finance'), 'Clear all fee balances', 'All outstanding fee balances must be paid', true, '{"Fee statement", "Payment receipts"}', 3),
((SELECT id FROM clearance_departments WHERE name = 'Finance'), 'Return student ID card', 'Student ID card must be returned to finance office', true, '{"Student ID card"}', 1),
((SELECT id FROM clearance_departments WHERE name = 'Finance'), 'Submit refund application', 'Submit application for any fee refunds if applicable', false, '{"Refund application form", "Bank details"}', 5),

-- IT Department requirements
((SELECT id FROM clearance_departments WHERE name = 'IT Department'), 'Return all IT equipment', 'All borrowed IT equipment must be returned', true, '{"Equipment return form", "Condition report"}', 2),
((SELECT id FROM clearance_departments WHERE name = 'IT Department'), 'Clear network access', 'Student network accounts must be deactivated', true, '{"Network access form"}', 1),
((SELECT id FROM clearance_departments WHERE name = 'IT Department'), 'Submit IT assets declaration', 'Declare any IT assets still in possession', false, '{"IT assets declaration form"}', 1),

-- Academic Office requirements
((SELECT id FROM clearance_departments WHERE name = 'Academic Office'), 'Submit all coursework', 'All pending coursework must be submitted', true, '{"Coursework submission receipts", "Academic transcript"}', 7),
((SELECT id FROM clearance_departments WHERE name = 'Academic Office'), 'Complete evaluation forms', 'Complete course and lecturer evaluation forms', true, '{"Evaluation forms"}', 2),
((SELECT id FROM clearance_departments WHERE name = 'Academic Office'), 'Attend exit interview', 'Attend academic exit interview session', false, '{"Exit interview schedule"}', 3),

-- Student Affairs requirements
((SELECT id FROM clearance_departments WHERE name = 'Student Affairs'), 'Clear disciplinary records', 'Ensure no pending disciplinary cases', true, '{"Disciplinary clearance certificate"}', 3),
((SELECT id FROM clearance_departments WHERE name = 'Student Affairs'), 'Return student handbook', 'Return student handbook and regulations booklet', false, '{"Student handbook"}', 1),

-- Security requirements
((SELECT id FROM clearance_departments WHERE name = 'Security'), 'Return access cards', 'Return all access cards and security passes', true, '{"Access cards", "Security passes"}', 1),
((SELECT id FROM clearance_departments WHERE name = 'Security'), 'Clear security incidents', 'Ensure no pending security incident reports', true, '{"Security clearance form"}', 2),

-- Hostel requirements
((SELECT id FROM clearance_departments WHERE name = 'Hostel'), 'Vacate hostel room', 'Completely vacate assigned hostel room', true, '{"Room inspection report", "Key return receipt"}', 2),
((SELECT id FROM clearance_departments WHERE name = 'Hostel'), 'Pay hostel damages', 'Pay for any damages to hostel property', true, '{"Damage assessment report", "Payment receipt"}', 3),
((SELECT id FROM clearance_departments WHERE name = 'Hostel'), 'Return hostel bedding', 'Return all issued hostel bedding and furniture', true, '{"Bedding return checklist"}', 1),

-- Health Center requirements
((SELECT id FROM clearance_departments WHERE name = 'Health Center'), 'Complete medical clearance', 'Complete final medical examination', false, '{"Medical clearance form", "Health records"}', 2),
((SELECT id FROM clearance_departments WHERE name = 'Health Center'), 'Return medical equipment', 'Return any borrowed medical equipment', true, '{"Medical equipment return form"}', 1);

-- Insert sample clearance records for students
INSERT INTO clearance_records (registration_number, department, department_type, status, requirements, pending_requirements, progress_percentage) VALUES
-- For student CLIPS/2024/001
('CLIPS/2024/001', 'Library', 'academic', 'completed', 
 '{"Return all borrowed books", "Pay outstanding library fines", "Complete library exit survey"}', 
 '{}', 100),
('CLIPS/2024/001', 'Finance', 'administrative', 'pending', 
 '{"Clear all fee balances", "Return student ID card", "Submit refund application"}', 
 '{"Clear all fee balances", "Return student ID card"}', 33),
('CLIPS/2024/001', 'IT Department', 'technical', 'pending', 
 '{"Return all IT equipment", "Clear network access", "Submit IT assets declaration"}', 
 '{"Return all IT equipment", "Clear network access"}', 33),
('CLIPS/2024/001', 'Academic Office', 'academic', 'in-progress', 
 '{"Submit all coursework", "Complete evaluation forms", "Attend exit interview"}', 
 '{"Submit all coursework"}', 67),
('CLIPS/2024/001', 'Student Affairs', 'administrative', 'completed', 
 '{"Clear disciplinary records", "Return student handbook"}', 
 '{}', 100),
('CLIPS/2024/001', 'Security', 'administrative', 'pending', 
 '{"Return access cards", "Clear security incidents"}', 
 '{"Return access cards", "Clear security incidents"}', 0),

-- For student CLIPS/2024/002
('CLIPS/2024/002', 'Library', 'academic', 'completed', 
 '{"Return all borrowed books", "Pay outstanding library fines"}', 
 '{}', 100),
('CLIPS/2024/002', 'Finance', 'administrative', 'completed', 
 '{"Clear all fee balances", "Return student ID card"}', 
 '{}', 100),
('CLIPS/2024/002', 'IT Department', 'technical', 'completed', 
 '{"Return all IT equipment", "Clear network access"}', 
 '{}', 100),
('CLIPS/2024/002', 'Academic Office', 'academic', 'completed', 
 '{"Submit all coursework", "Complete evaluation forms"}', 
 '{}', 100),
('CLIPS/2024/002', 'Student Affairs', 'administrative', 'completed', 
 '{"Clear disciplinary records"}', 
 '{}', 100),
('CLIPS/2024/002', 'Security', 'administrative', 'completed', 
 '{"Return access cards", "Clear security incidents"}', 
 '{}', 100);

-- Insert sample clearance requests
INSERT INTO clearance_requests (registration_number, request_type, request_reason, status, priority, documents_required, documents_submitted) VALUES
('CLIPS/2024/001', 'academic', 'Need academic clearance for graduation ceremony', 'pending', 'high', 
 '{"Academic transcript", "Coursework completion certificate", "Evaluation forms"}', 
 '{"Academic transcript", "Evaluation forms"}'),
('CLIPS/2024/001', 'financial', 'Request financial clearance for fee refund', 'in-progress', 'normal', 
 '{"Fee statement", "Payment receipts", "Refund application"}', 
 '{"Fee statement", "Payment receipts"}'),
('CLIPS/2024/001', 'library', 'Library clearance for book return extension', 'approved', 'normal', 
 '{"Library card", "Extension application"}', 
 '{"Library card", "Extension application"}'),
('CLIPS/2024/002', 'graduation', 'Complete graduation clearance package', 'approved', 'high', 
 '{"Academic clearance", "Financial clearance", "Library clearance", "Security clearance"}', 
 '{"Academic clearance", "Financial clearance", "Library clearance", "Security clearance"}'),
('CLIPS/2024/002', 'transfer', 'Transfer clearance for university application', 'completed', 'urgent', 
 '{"Academic transcript", "Transfer letter", "Clearance certificates"}', 
 '{"Academic transcript", "Transfer letter", "Clearance certificates"}');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clearance_records_reg_number ON clearance_records(registration_number);
CREATE INDEX IF NOT EXISTS idx_clearance_records_status ON clearance_records(status);
CREATE INDEX IF NOT EXISTS idx_clearance_records_department ON clearance_records(department);
CREATE INDEX IF NOT EXISTS idx_clearance_requests_reg_number ON clearance_requests(registration_number);
CREATE INDEX IF NOT EXISTS idx_clearance_requests_status ON clearance_requests(status);
CREATE INDEX IF NOT EXISTS idx_clearance_requests_priority ON clearance_requests(priority);
CREATE INDEX IF NOT EXISTS idx_clearance_requirements_department ON clearance_requirements(department_id);

-- Create a view for clearance summary
CREATE OR REPLACE VIEW clearance_summary AS
SELECT 
    r.registration_number,
    COUNT(*) as total_departments,
    COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_departments,
    COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_departments,
    COUNT(CASE WHEN r.status = 'in-progress' THEN 1 END) as in_progress_departments,
    ROUND(
        (COUNT(CASE WHEN r.status = 'completed' THEN 1 END) * 100.0 / COUNT(*)), 
        2
    ) as completion_percentage
FROM clearance_records r
GROUP BY r.registration_number;

-- Create a view for clearance dashboard
CREATE OR REPLACE VIEW clearance_dashboard AS
SELECT 
    r.registration_number,
    r.department,
    r.department_type,
    r.status,
    r.progress_percentage,
    r.cleared_by,
    r.cleared_date,
    r.notes,
    array_length(r.requirements, 1) as total_requirements,
    array_length(r.pending_requirements, 1) as pending_requirements_count,
    req.contact_person as department_contact,
    req.contact_email as department_email,
    req.office_location as department_office
FROM clearance_records r
LEFT JOIN clearance_departments req ON r.department = req.name
ORDER BY r.registration_number, r.department;

-- Insert triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clearance_records_updated_at 
    BEFORE UPDATE ON clearance_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clearance_requests_updated_at 
    BEFORE UPDATE ON clearance_requests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clearance_departments_updated_at 
    BEFORE UPDATE ON clearance_departments 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clearance_requirements_updated_at 
    BEFORE UPDATE ON clearance_requirements 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

COMMIT;

-- Display success message
SELECT 'Enhanced Clearance System Database Schema Created Successfully!' as message;
SELECT 'Sample data inserted for testing purposes.' as note;
SELECT 'You can now test the clearance system with the provided sample data.' as instruction;
