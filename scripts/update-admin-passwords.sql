-- Update admin password hashes with correct bcrypt hashes
-- admin password: admin123
-- clips_admin password: clips2024

UPDATE admins SET password_hash = '$2b$10$ndgbNfOHtPKeQCWlLueN5.d1c/21DCNzmeT8wJuaEp6fSnFYff7dG' WHERE username = 'admin';
UPDATE admins SET password_hash = '$2b$10$x8UDR6uAZ/hVXz7aBfyrhuSDICjmzMnmqHDBLeBh7oea9FiXi1Pvi' WHERE username = 'clips_admin';

-- Verify the updates
SELECT username, email, full_name, is_active, created_at FROM admins;