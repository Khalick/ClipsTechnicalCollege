@echo off
echo ========================================
echo CLIPSTECH - Unit Allocation Migration
echo ========================================
echo.
echo INSTRUCTIONS:
echo 1. Open your Supabase project dashboard
echo 2. Go to the SQL Editor
echo 3. Copy and paste the SQL below
echo 4. Run the SQL to create the missing table
echo.
echo SQL TO RUN:
echo ========================================
type scripts\add-unit-allocations-table.sql
echo.
echo ========================================
echo After running the SQL, restart your Next.js application
echo The unit allocation system will then work properly!
pause
