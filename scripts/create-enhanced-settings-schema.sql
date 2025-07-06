-- Create tables for enhanced settings section features
-- This script creates tables for notification settings, privacy settings, and support tickets

-- Student notification settings table
CREATE TABLE IF NOT EXISTS student_notification_settings (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL,
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    push_notifications BOOLEAN DEFAULT TRUE,
    fee_reminders BOOLEAN DEFAULT TRUE,
    academic_updates BOOLEAN DEFAULT TRUE,
    system_alerts BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(registration_number)
);

-- Student privacy settings table
CREATE TABLE IF NOT EXISTS student_privacy_settings (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL,
    profile_visibility VARCHAR(20) DEFAULT 'private' CHECK (profile_visibility IN ('public', 'private', 'friends')),
    share_academic_info BOOLEAN DEFAULT FALSE,
    share_contact_info BOOLEAN DEFAULT FALSE,
    data_analytics BOOLEAN DEFAULT TRUE,
    third_party_sharing BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(registration_number)
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(20) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('technical', 'account', 'billing', 'academic', 'other')),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed', 'resolved')),
    assigned_to VARCHAR(100) DEFAULT NULL,
    admin_notes TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP DEFAULT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notification_settings_reg_number ON student_notification_settings(registration_number);
CREATE INDEX IF NOT EXISTS idx_privacy_settings_reg_number ON student_privacy_settings(registration_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_reg_number ON support_tickets(registration_number);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_support_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_support_tickets_created_at ON support_tickets(created_at);

-- Add foreign key constraints (assuming students table exists)
ALTER TABLE student_notification_settings 
ADD CONSTRAINT fk_notification_settings_student 
FOREIGN KEY (registration_number) REFERENCES students(registration_number) ON DELETE CASCADE;

ALTER TABLE student_privacy_settings 
ADD CONSTRAINT fk_privacy_settings_student 
FOREIGN KEY (registration_number) REFERENCES students(registration_number) ON DELETE CASCADE;

ALTER TABLE support_tickets 
ADD CONSTRAINT fk_support_tickets_student 
FOREIGN KEY (registration_number) REFERENCES students(registration_number) ON DELETE CASCADE;


-
-- Add comments for documentation
COMMENT ON TABLE student_notification_settings IS 'Stores notification preferences for each student';
COMMENT ON TABLE student_privacy_settings IS 'Stores privacy preferences for each student';
COMMENT ON TABLE support_tickets IS 'Stores support tickets created by students';

COMMENT ON COLUMN student_notification_settings.email_notifications IS 'Whether student wants to receive email notifications';
COMMENT ON COLUMN student_notification_settings.sms_notifications IS 'Whether student wants to receive SMS notifications';
COMMENT ON COLUMN student_notification_settings.push_notifications IS 'Whether student wants to receive push notifications';
COMMENT ON COLUMN student_notification_settings.fee_reminders IS 'Whether student wants to receive fee payment reminders';
COMMENT ON COLUMN student_notification_settings.academic_updates IS 'Whether student wants to receive academic updates';
COMMENT ON COLUMN student_notification_settings.system_alerts IS 'Whether student wants to receive system alerts';
COMMENT ON COLUMN student_notification_settings.marketing_emails IS 'Whether student wants to receive marketing emails';

COMMENT ON COLUMN student_privacy_settings.profile_visibility IS 'Controls who can view student profile (public, private, friends)';
COMMENT ON COLUMN student_privacy_settings.share_academic_info IS 'Whether to share academic information with other students';
COMMENT ON COLUMN student_privacy_settings.share_contact_info IS 'Whether to share contact information with other students';
COMMENT ON COLUMN student_privacy_settings.data_analytics IS 'Whether to allow data collection for analytics';
COMMENT ON COLUMN student_privacy_settings.third_party_sharing IS 'Whether to allow sharing data with third parties';

COMMENT ON COLUMN support_tickets.category IS 'Category of the support ticket (technical, account, billing, academic, other)';
COMMENT ON COLUMN support_tickets.priority IS 'Priority level of the ticket (low, medium, high, urgent)';
COMMENT ON COLUMN support_tickets.status IS 'Current status of the ticket (open, in_progress, closed, resolved)';
COMMENT ON COLUMN support_tickets.assigned_to IS 'Admin or support staff assigned to handle the ticket';
COMMENT ON COLUMN support_tickets.admin_notes IS 'Internal notes from admin or support staff';
COMMENT ON COLUMN support_tickets.resolved_at IS 'Timestamp when the ticket was resolved';
