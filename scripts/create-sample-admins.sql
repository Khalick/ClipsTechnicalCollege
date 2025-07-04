-- Sample admin users for CLIPS Technical College
-- Password for all users: password123
-- Hash generated using bcrypt with 10 rounds

-- Create sample admin users
INSERT INTO admins (username, password_hash, email, full_name, role, is_active) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@clipstech.edu', 'System Administrator', 'admin', true),
('clips_admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'clips.admin@clipstech.edu', 'CLIPS Administrator', 'admin', true),
('testadmin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'testadmin@clipstech.edu', 'Test Administrator', 'admin', true),
('registrar', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'registrar@clipstech.edu', 'Academic Registrar', 'admin', true),
('finance', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'finance@clipstech.edu', 'Finance Officer', 'admin', true)
ON CONFLICT (username) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = NOW();

-- Display created users
SELECT 
    username,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM admins
ORDER BY created_at DESC;
