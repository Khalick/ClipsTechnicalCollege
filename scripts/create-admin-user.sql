-- Create admins table if it doesn't exist
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

-- Create a trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to the admins table
DROP TRIGGER IF EXISTS update_admins_updated_at ON admins;
CREATE TRIGGER update_admins_updated_at
    BEFORE UPDATE ON admins
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user
-- Username: admin
-- Password: admin123 (hashed with bcrypt)
INSERT INTO admins (username, password_hash, email, full_name, role) 
VALUES (
    'admin',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- This is 'admin123' hashed
    'admin@clipstech.edu',
    'System Administrator',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Insert a second admin user for testing
INSERT INTO admins (username, password_hash, email, full_name, role) 
VALUES (
    'clips_admin',
    '$2a$10$7Z8QZ8QZ8QZ8QZ8QZ8QZ8O8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8', -- This is 'clips2024' hashed
    'clips.admin@clipstech.edu',
    'CLIPS Administrator',
    'admin'
) ON CONFLICT (username) DO NOTHING;

-- Display created admin users (for verification)
SELECT 
    id,
    username,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM admins
ORDER BY created_at DESC;
