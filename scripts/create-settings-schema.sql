-- Settings and Support System Database Schema
-- This script creates the necessary tables for the student settings functionality

-- Create student_notification_settings table
CREATE TABLE IF NOT EXISTS student_notification_settings (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    fee_reminders BOOLEAN DEFAULT true,
    academic_updates BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create support_requests table
CREATE TABLE IF NOT EXISTS support_requests (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    admin_response TEXT,
    admin_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Create student_privacy_settings table
CREATE TABLE IF NOT EXISTS student_privacy_settings (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    profile_visibility VARCHAR(20) DEFAULT 'private',
    share_academic_info BOOLEAN DEFAULT false,
    share_contact_info BOOLEAN DEFAULT false,
    data_analytics BOOLEAN DEFAULT true,
    third_party_sharing BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add additional columns to students table for enhanced profile information
ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS postal_address TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS clips_email VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS gender VARCHAR(10) DEFAULT 'Male';
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS next_of_kin_name VARCHAR(100);
ALTER TABLE students ADD COLUMN IF NOT EXISTS next_of_kin_phone VARCHAR(20);
ALTER TABLE students ADD COLUMN IF NOT EXISTS next_of_kin_relationship VARCHAR(50);
ALTER TABLE students ADD COLUMN IF NOT EXISTS password VARCHAR(255);
ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;




-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_notification_settings_reg_number ON student_notification_settings(registration_number);
CREATE INDEX IF NOT EXISTS idx_support_requests_reg_number ON support_requests(registration_number);
CREATE INDEX IF NOT EXISTS idx_support_requests_status ON support_requests(status);
CREATE INDEX IF NOT EXISTS idx_support_requests_ticket_id ON support_requests(ticket_id);
CREATE INDEX IF NOT EXISTS idx_student_privacy_settings_reg_number ON student_privacy_settings(registration_number);


-- Add comments to tables
COMMENT ON TABLE student_notification_settings IS 'Stores notification preferences for each student';
COMMENT ON TABLE support_requests IS 'Stores support tickets and requests from students';
COMMENT ON TABLE student_privacy_settings IS 'Stores privacy preferences for each student';

-- Add comments to important columns
COMMENT ON COLUMN support_requests.ticket_id IS 'Unique identifier for support tickets';
COMMENT ON COLUMN support_requests.category IS 'Category of support request: technical, account, billing, academic, other';
COMMENT ON COLUMN support_requests.priority IS 'Priority level: low, medium, high, urgent';
COMMENT ON COLUMN support_requests.status IS 'Current status: open, in_progress, resolved, closed';

PRINT 'Settings and Support System schema created successfully!';
