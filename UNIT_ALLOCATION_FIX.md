# Unit Allocation System - Database Migration

## Problem
The unit allocation system was trying to use a `student_unit_allocations` table that doesn't exist in the database. The error was:

```
Could not find a relationship between 'student_unit_allocations' and 'units' in the schema cache
```

## Solution
We need to create the missing `student_unit_allocations` table in the Supabase database.

## How to Fix

### Step 1: Run the Database Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the SQL from `scripts/add-unit-allocations-table.sql`
4. Click **Run** to execute the SQL

### Step 2: Restart Your Application

After running the SQL migration, restart your Next.js development server:

```bash
# Stop the current server (Ctrl+C)
# Then restart
npm run dev
```

## Alternative Ways to Run Migration

### Using PowerShell (Recommended for Windows)
```powershell
.\apply-unit-allocation-migration.ps1
```

### Using Command Prompt
```cmd
apply-unit-allocation-migration.bat
```

### Manual SQL (Copy and paste this into Supabase SQL Editor)
```sql
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
```

## What This Does

1. **Creates the missing table** (`student_unit_allocations`) that the API endpoints expect
2. **Sets up proper relationships** between students, units, and allocations
3. **Enables Row Level Security** for data protection
4. **Creates access policies** so students can only see their own allocations

## Testing

After running the migration, you can test:

1. **Admin side**: Go to admin dashboard and try allocating units to students
2. **Student side**: Login as a student and check if allocated units appear
3. **Registration**: Try registering for allocated units

## Table Structure

The new `student_unit_allocations` table contains:
- `id`: Primary key
- `student_id`: Reference to student
- `unit_id`: Reference to unit
- `allocated_by`: Who allocated it (default: 'admin')
- `allocated_at`: When it was allocated
- `status`: Allocation status (default: 'allocated')

This is separate from the `student_units` table which tracks actual registrations.
