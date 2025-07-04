@echo off
echo Setting up PostgreSQL connection...
set PGHOST=aws-0-us-east-2.pooler.supabase.com
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=postgres.sduhvbitslcjerfrfeaw
set PGPASSWORD=Clipstech123

echo Creating sample admin user...
psql -c "INSERT INTO admins (username, password_hash, email, full_name, role) VALUES ('testadmin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'testadmin@clipstech.edu', 'Test Administrator', 'admin') ON CONFLICT (username) DO NOTHING;"

echo Verifying admin user was created...
psql -c "SELECT username, email, full_name, role, is_active FROM admins;"

echo Admin user creation complete!
echo.
echo Login credentials:
echo Username: testadmin
echo Password: password
echo.
pause
