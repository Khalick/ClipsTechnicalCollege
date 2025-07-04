-- Add sample allocated units for testing
-- This script adds some allocated units to test the allocation system

-- Insert some sample units if they don't exist
INSERT INTO units (unit_name, unit_code, description, credits) VALUES
('Introduction to Programming', 'CS101', 'Basic programming concepts and problem solving', 3),
('Database Systems', 'CS201', 'Introduction to database design and SQL', 3),
('Web Development', 'CS301', 'HTML, CSS, JavaScript and modern web frameworks', 4),
('Data Structures', 'CS202', 'Arrays, linked lists, trees, and graphs', 3),
('Software Engineering', 'CS401', 'Software development lifecycle and project management', 4)
ON CONFLICT (unit_code) DO NOTHING;

-- Insert some allocated units (status = 'allocated') for student with ID 1
-- Note: Make sure the student exists in your database first
INSERT INTO student_units (student_id, unit_id, status) 
SELECT 1, u.id, 'allocated'
FROM units u 
WHERE u.unit_code IN ('CS101', 'CS201', 'CS301')
ON CONFLICT (student_id, unit_id) DO NOTHING;

-- Insert some allocated units for student with ID 2 (if exists)
INSERT INTO student_units (student_id, unit_id, status) 
SELECT 2, u.id, 'allocated'
FROM units u 
WHERE u.unit_code IN ('CS101', 'CS202')
ON CONFLICT (student_id, unit_id) DO NOTHING;

-- Check what was inserted
SELECT 
    s.name as student_name,
    s.registration_number,
    u.unit_code,
    u.unit_name,
    su.status,
    su.registration_date
FROM student_units su
JOIN students s ON su.student_id = s.id
JOIN units u ON su.unit_id = u.id
WHERE su.status = 'allocated'
ORDER BY s.name, u.unit_code;
