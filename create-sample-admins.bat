@echo off
echo Setting up PostgreSQL connection...
set PGHOST=aws-0-us-east-2.pooler.supabase.com
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=postgres.sduhvbitslcjerfrfeaw
set PGPASSWORD=Clipstech123

echo Creating sample admin users...
psql -f scripts/create-sample-admins.sql

echo.
echo ===================================
echo Sample Admin Users Created:
echo ===================================
echo Username: admin
echo Password: password123
echo Email: admin@clipstech.edu
echo Role: System Administrator
echo.
echo Username: clips_admin  
echo Password: password123
echo Email: clips.admin@clipstech.edu
echo Role: CLIPS Administrator
echo.
echo Username: testadmin
echo Password: password123
echo Email: testadmin@clipstech.edu
echo Role: Test Administrator
echo.
echo Username: registrar
echo Password: password123
echo Email: registrar@clipstech.edu
echo Role: Academic Registrar
echo.
echo Username: finance
echo Password: password123
echo Email: finance@clipstech.edu
echo Role: Finance Officer
echo ===================================
echo.
pause
