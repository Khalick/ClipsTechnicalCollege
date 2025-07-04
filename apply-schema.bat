@echo off
echo Setting up PostgreSQL connection...
set PGHOST=aws-0-us-east-2.pooler.supabase.com
set PGPORT=5432
set PGDATABASE=postgres
set PGUSER=postgres.sduhvbitslcjerfrfeaw
set PGPASSWORD=Clipstech123

echo Checking connection...
psql -c "SELECT version();"

echo Applying schema...
psql -f scripts/supabase-schema.sql

echo Verifying tables were created...
psql -c "\dt"

echo Schema application complete!
pause
