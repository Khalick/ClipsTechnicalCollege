-- Add first_login flag to admins and students tables
ALTER TABLE admins ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT true;
ALTER TABLE students ADD COLUMN IF NOT EXISTS first_login BOOLEAN DEFAULT true;