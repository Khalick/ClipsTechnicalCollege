-- Add sample documents for testing
-- This script adds sample documents to the student_documents table

-- Sample documents for student with registration number 'STU001'
INSERT INTO student_documents (registration_number, document_type, file_url, file_name, file_size)
VALUES 
    ('STU001', 'exam-card', 'https://example.com/documents/exam-card-stu001.pdf', 'Exam Card - STU001.pdf', 245760),
    ('STU001', 'fees-structure', 'https://example.com/documents/fees-structure-stu001.pdf', 'Fees Structure - STU001.pdf', 186340),
    ('STU001', 'results', 'https://example.com/documents/results-stu001.pdf', 'Academic Results - STU001.pdf', 198520),
    ('STU001', 'transcript', 'https://example.com/documents/transcript-stu001.pdf', 'Official Transcript - STU001.pdf', 312400);

-- Sample documents for student with registration number 'STU002'
INSERT INTO student_documents (registration_number, document_type, file_url, file_name, file_size)
VALUES 
    ('STU002', 'exam-card', 'https://example.com/documents/exam-card-stu002.pdf', 'Exam Card - STU002.pdf', 251200),
    ('STU002', 'fees-structure', 'https://example.com/documents/fees-structure-stu002.pdf', 'Fees Structure - STU002.pdf', 178960);

-- Sample documents for student with registration number 'CS001'
INSERT INTO student_documents (registration_number, document_type, file_url, file_name, file_size)
VALUES 
    ('CS001', 'exam-card', 'https://example.com/documents/exam-card-cs001.pdf', 'Exam Card - CS001.pdf', 267840),
    ('CS001', 'results', 'https://example.com/documents/results-cs001.pdf', 'Academic Results - CS001.pdf', 203750);

-- Note: These are sample URLs. In a real implementation, these would be actual file URLs
-- from your file storage system (like AWS S3, Google Cloud Storage, etc.)
