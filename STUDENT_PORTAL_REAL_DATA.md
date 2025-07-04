# Student Portal Real Data Implementation

## Overview

This document describes the implementation of real data fetching for the student portal, specifically for student profile information and fees management.

## Changes Made

### 1. Student Profile API Endpoint

**File:** `app/api/students/profile/[regNumber]/route.ts`
- Created a new API endpoint to fetch student profile data by registration number
- Uses `supabaseAdmin` client to query the `students` table
- Returns student information including name, email, course, level of study, etc.

### 2. Updated Student Dashboard Component

**File:** `components/student/StudentDashboard.tsx`
- Modified the `fetchStudentData` function to call the new profile API endpoint
- Now fetches real student data instead of using hardcoded mock data
- Maintains fallback to mock data if API calls fail
- Proper error handling and loading states

### 3. Database Schema and Sample Data

**Files:** 
- `scripts/supabase-schema.sql` - Contains sample student data for testing
- `scripts/setup-local-database.sql` - Local database setup with sample data

## Sample Student Data

The following test students are available in the database:

| Registration Number | Name | Course | Level | Email |
|---------------------|------|--------|-------|--------|
| CS/001/2024 | John Doe | Computer Science | Year 2 Semester 1 | john.doe@student.clips.edu |
| CS/002/2024 | Jane Smith | Computer Science | Year 1 Semester 2 | jane.smith@student.clips.edu |
| IT/001/2024 | Mike Johnson | Information Technology | Year 3 Semester 1 | mike.johnson@student.clips.edu |
| CS/003/2024 | Emily Davis | Computer Science | Year 1 Semester 1 | emily.davis@student.clips.edu |
| IT/002/2024 | Alex Wilson | Information Technology | Year 2 Semester 1 | alex.wilson@student.clips.edu |

## Testing

### 1. Database Setup

Make sure your database has the required tables and sample data:

```powershell
# Apply the schema to create tables and insert sample data
./apply-schema.ps1
```

### 2. Test Student Profile API

Run the test script to verify the API endpoint:

```powershell
# Test the student profile API endpoint
./test-student-profile.ps1
```

### 3. Test Student Portal

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `/student` in your browser
3. Log in with one of the test student accounts
4. Verify that the student dashboard shows real data:
   - Correct student name and email
   - Accurate course and level of study information
   - Real date of birth and other profile details

## Student Authentication

The student portal uses the `useStudentAuth` hook which provides:
- `user.name` - Student's name
- `user.registrationNumber` - Student's registration number
- `user.email` - Student's email (if available)

The registration number is used to fetch both profile and fees data from the respective API endpoints.

## API Endpoints

### Student Profile
- **URL:** `/api/students/profile/[regNumber]`
- **Method:** GET
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "John Doe",
    "registration_number": "CS/001/2024",
    "course": "Computer Science",
    "level_of_study": "Year 2 Semester 1",
    "status": "active",
    "national_id": "12345678",
    "date_of_birth": "1995-01-01",
    "email": "john.doe@student.clips.edu"
  }
}
```

### Student Fees
- **URL:** `/api/students/fees/[regNumber]`
- **Method:** GET
- **Response:**
```json
{
  "success": true,
  "data": {
    "fee_balance": 133200,
    "total_paid": 42800,
    "semester_fee": 56120,
    "session_progress": 65
  }
}
```

## Error Handling

Both the profile and fees API endpoints include proper error handling:
- 400 Bad Request - When registration number is missing
- 404 Not Found - When student is not found
- 500 Internal Server Error - For server-side errors

The frontend components gracefully handle API failures by falling back to mock data and displaying appropriate error messages.

## Next Steps

1. **Units Registration:** Update the units fetching logic to use real API data
2. **Document Management:** Implement real document upload and retrieval
3. **Payment History:** Add detailed payment history with real transaction data
4. **Academic Records:** Integrate with academic records system

## Troubleshooting

### Common Issues

1. **"Student not found" error:**
   - Ensure the student exists in the database
   - Check that the registration number format matches exactly
   - Verify the database connection is working

2. **API returning 500 errors:**
   - Check the server logs for detailed error messages
   - Verify Supabase configuration
   - Ensure the `students` table exists and has the correct schema

3. **Mock data still showing:**
   - Check the browser console for API errors
   - Verify the API endpoint is responding correctly
   - Ensure the student is properly authenticated

### Testing Commands

```powershell
# Test database connection
node test-db-connection.js

# Test student profile API
./test-student-profile.ps1

# Test fees API
./test-fee-system.ps1

# Run the application
npm run dev
```
