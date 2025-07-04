# Student Authentication System

## Overview
The student authentication system uses an age-based password mechanism where students use different identification documents as their login passwords based on their age.

## Age-Based Password System

### For Students 18 years and older (Adults)
- **Password**: National ID number
- **Required**: Yes
- **Used for**: Login authentication

### For Students under 18 years (Minors)
- **Password**: Birth Certificate number
- **Required**: Yes
- **Used for**: Login authentication

## Implementation Details

### 1. Student Registration Form
- **Location**: `components/forms/StudentRegistrationForm.tsx`
- **Features**:
  - Automatic age calculation from date of birth
  - Dynamic form fields based on age
  - Clear labeling indicating which field will be used as password
  - Validation to ensure required authentication field is provided

### 2. Student Login System
- **Location**: `app/api/auth/student-login/route.ts`
- **Features**:
  - Age calculation from stored date of birth
  - Automatic determination of which field to use as password
  - Specific error messages indicating which document type is expected
  - JWT token generation for authenticated sessions

### 3. Student Login Form
- **Location**: `components/student/StudentLoginForm.tsx`
- **Features**:
  - Clear instructions about password requirements
  - Enhanced error handling with specific messages
  - Visual guidance for users

### 4. Authentication Hook
- **Location**: `hooks/useStudentAuth.tsx`
- **Features**:
  - Improved error message propagation
  - Session management with localStorage
  - Type-safe authentication state

## Database Schema
The system uses the following fields in the `students` table:
- `national_id` (optional for minors, required for adults)
- `birth_certificate` (optional for adults, required for minors)
- `date_of_birth` (required for age calculation)
- `registration_number` (used as username)

## Security Features
- JWT tokens for session management
- Age-based field validation
- Input validation for document numbers
- Clear error messages without exposing sensitive information

## Testing Data
Mock students are provided for testing:
1. John Doe (29 years old) - uses National ID: `12345678`
2. Jane Smith (16 years old) - uses Birth Certificate: `BC789012`
3. Mike Johnson (17 years old) - uses Birth Certificate: `BC345678`

## User Experience
- Clear instructions during registration about which document will be used
- Intuitive login form with guidance
- Specific error messages to help users understand authentication requirements
- Visual indicators for adult vs minor status during registration
