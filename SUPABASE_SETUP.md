# Supabase Setup Guide

## Quick Setup

Your project is now configured to use Supabase as the default database. Here's what you need to do:

### 1. Environment Variables
Make sure your `.env.local` file contains:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application Configuration
SECRET_KEY=your_jwt_secret_key
NODE_ENV=development
```

### 2. Database Schema
Run the SQL script in your Supabase SQL Editor:
```bash
# Copy the contents of scripts/supabase-schema.sql
# Paste and execute in Supabase Dashboard > SQL Editor
```

### 3. Test Connection
Visit `/api/health` to verify your Supabase connection is working.

## Key Changes Made

- ✅ Removed PostgreSQL `DATABASE_URL`
- ✅ Updated all API routes to use Supabase client
- ✅ Simplified database configuration
- ✅ Maintained existing functionality

## Usage Examples

### Basic Query
```typescript
import { supabase } from '@/lib/db'

// Fetch data
const { data, error } = await supabase
  .from('students')
  .select('*')
  .eq('status', 'active')

// Insert data
const { data, error } = await supabase
  .from('students')
  .insert({ name: 'John Doe', registration_number: 'CS/001/2024' })
```

### File Upload
```typescript
import { uploadFileToSupabase } from '@/lib/storage'

const result = await uploadFileToSupabase(file, 'photos', 'student_123')
```

Your project is now fully configured to use Supabase! 🚀