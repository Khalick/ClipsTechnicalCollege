# CLIPS Technical College Portal - Supabase Edition

A comprehensive student and admin portal for CLIPS Technical College built with Next.js, TypeScript, and Supabase.

## Features

### Supabase Integration
- **Database:** PostgreSQL with Row Level Security (RLS)
- **Storage:** File uploads with automatic bucket management
- **Authentication:** Secure admin and student authentication
- **Real-time:** Built-in real-time capabilities (can be extended)

## Prerequisites

- Node.js 18+
- Supabase account and project
- npm or yarn package manager

## Supabase Setup

### 1. Create Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully initialized
3. Note down your project URL and API keys

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# JWT Secret (optional, for additional security)
SECRET_KEY=your_jwt_secret_key_here

# Environment
NODE_ENV=development
\`\`\`

### 3. Set Up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `scripts/supabase-schema.sql`
4. Run the SQL script to create all tables, policies, and sample data

### 4. Configure Storage

The application will automatically create the required storage bucket (`student-documents`) when you first upload a file. The bucket will be configured with:

- **Public access** for easy file serving
- **File type restrictions** (images, PDFs, documents)
- **10MB file size limit**

## Installation and Running

1. **Install dependencies:**
   \`\`\`bash
   npm install
   \`\`\`

2. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   \`\`\`

3. **Set up database schema:**
   - Copy `scripts/supabase-schema.sql` content
   - Paste and run in Supabase SQL Editor

4. **Start the development server:**
   \`\`\`bash
   npm run dev
   \`\`\`

5. **Access the application:**
   - Student Portal: [http://localhost:3000](http://localhost:3000)
   - Admin Portal: [http://localhost:3000/admin](http://localhost:3000/admin)

## Default Credentials

### Admin Accounts
- **Primary Admin:** `admin` / `admin123`
- **Secondary Admin:** `clips_admin` / `clips2024`

### Sample Students
- **Student 1:** `CS/001/2024` / `password123`
- **Student 2:** `CS/002/2024` / `password123`
- **Student 3:** `IT/001/2024` / `password123`

## Supabase Features Used

### Database
- **PostgreSQL:** Full-featured relational database
- **Row Level Security (RLS):** Secure data access policies
- **Triggers:** Automatic timestamp updates
- **Foreign Keys:** Data integrity constraints

### Storage
- **Buckets:** Organized file storage
- **Public URLs:** Direct file access
- **File Policies:** Security and access control
- **Automatic Management:** Bucket creation and configuration

### Security
- **RLS Policies:** Row-level data protection
- **Service Role:** Admin-level database access
- **Anon Key:** Public API access with restrictions
- **JWT Integration:** Token-based authentication

## API Endpoints

### Admin API
- `POST /api/auth/admin-login` - Admin authentication
- `GET /api/admin/verify-token` - Token verification
- `GET /api/health` - System health check

### Student API
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `PUT /api/students/[id]` - Update student
- `POST /api/students/[id]/deregister` - Deregister student

### File Upload API
- `POST /api/upload/exam-card` - Upload exam cards
- `POST /api/upload/fees-structure` - Upload fee documents

### Units API
- `GET /api/units` - List academic units
- `POST /api/units` - Create new unit

## Database Schema

### Core Tables
- **admins** - Administrator accounts
- **students** - Student records
- **units** - Academic units/courses
- **student_documents** - File upload records
- **student_units** - Unit registrations
- **fees** - Fee management
- **fee_payments** - Payment tracking

### Security Policies
- **Service Role Access:** Full admin access to all tables
- **Student Access:** Students can only view their own data
- **Public Access:** Units are viewable by authenticated users

## File Storage Structure

\`\`\`
student-documents/
├── photos/              # Student profile photos
├── exam-card/           # Exam cards and certificates
├── fees-structure/      # Fee-related documents
└── documents/           # General documents
\`\`\`

## Development

### Adding New Features

1. **Database Changes:**
   - Update `scripts/supabase-schema.sql`
   - Run new migrations in Supabase SQL Editor

2. **API Endpoints:**
   - Add to `app/api/` directory
   - Use Supabase client for database operations

3. **File Uploads:**
   - Use `uploadFileToSupabase()` from `lib/storage.ts`
   - Files automatically stored in appropriate buckets

### Testing

- **Health Check:** `/api/health` endpoint
- **Database Status:** Admin dashboard system status
- **File Uploads:** Test with sample documents
- **Authentication:** Try both admin and student logins

## Supabase Dashboard

Access your Supabase project dashboard to:

- **Monitor Database:** View tables, run queries
- **Manage Storage:** Browse uploaded files
- **Check Logs:** Debug API calls and errors
- **Configure Policies:** Adjust security settings
- **View Analytics:** Monitor usage and performance

## Production Deployment

### Vercel Deployment (Recommended)

1. **Connect Repository:** Link your GitHub repo to Vercel
2. **Environment Variables:** Add all Supabase keys to Vercel
3. **Deploy:** Automatic deployment on push to main branch

### Environment Variables for Production

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
SECRET_KEY=your_strong_production_secret
NODE_ENV=production
\`\`\`

### Security Considerations

1. **RLS Policies:** Ensure all tables have proper RLS policies
2. **API Keys:** Use environment-specific keys
3. **File Access:** Configure appropriate bucket policies
4. **CORS:** Set up allowed origins in Supabase settings

## Troubleshooting

### Common Issues

1. **Connection Errors:**
   - Verify Supabase URL and keys
   - Check project status in Supabase dashboard

2. **Authentication Issues:**
   - Ensure admin users exist in database
   - Verify password hashing matches

3. **File Upload Problems:**
   - Check storage bucket exists and is public
   - Verify file size and type restrictions

4. **Database Errors:**
   - Run schema setup script
   - Check RLS policies are correctly configured

### Useful Supabase SQL Queries

\`\`\`sql
-- Check admin users
SELECT * FROM admins;

-- Check students
SELECT * FROM students;

-- View uploaded documents
SELECT * FROM student_documents;

-- Check storage usage
SELECT * FROM storage.objects;
\`\`\`

## Support

For issues related to:
- **Supabase:** Check [Supabase Documentation](https://supabase.com/docs)
- **Next.js:** See [Next.js Documentation](https://nextjs.org/docs)
- **Application:** Create an issue in the project repository

This Supabase-powered version provides enterprise-grade database and storage capabilities with excellent scalability and security features.
