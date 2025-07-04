-- Migration to add student_unit_allocations table
-- Run this in Supabase SQL Editor to add the missing table

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

-- Enable Row Level Security
ALTER TABLE student_unit_allocations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Students can view own allocations" ON student_unit_allocations
    FOR SELECT USING (student_id::text = auth.uid()::text OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage allocations" ON student_unit_allocations
    FOR ALL USING (auth.role() = 'service_role');

-- Add some sample data for testing (optional)
-- INSERT INTO student_unit_allocations (student_id, unit_id, allocated_by, status) VALUES
-- (1, 1, 'admin', 'allocated'),
-- (1, 2, 'admin', 'allocated'),
-- (2, 1, 'admin', 'allocated');
