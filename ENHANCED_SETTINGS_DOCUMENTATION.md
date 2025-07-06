# Enhanced Settings System Documentation

## Overview

The Enhanced Settings System provides a comprehensive settings management interface for students in the CLIPS Technical College portal. It includes profile management, password changes, notification settings, privacy controls, and integrated help & support.

## Features

### 1. Profile Settings
- **Personal Information Management**
  - Full name editing
  - Contact information (email, phone, postal address)
  - CLIPS email configuration
  - Gender selection
  - Emergency contact details
  - Next of kin information
- **Profile Photo Upload**
  - Support for JPEG, PNG, and GIF formats
  - 5MB file size limit
  - Automatic image processing and storage
- **Read-only Fields**
  - Registration number
  - Course information
  - Level of study
  - Date of birth

### 2. Password Management
- **Secure Password Changes**
  - Current password verification using age-based authentication
  - New password strength validation
  - Password confirmation matching
  - Encrypted password storage
- **Password Requirements**
  - Minimum 8 characters
  - Mixed case letters recommended
  - Numbers and special characters encouraged

### 3. Notification Settings
- **Communication Preferences**
  - Email notifications toggle
  - SMS notifications toggle
  - Push notifications toggle
- **Content Preferences**
  - Fee reminders
  - Academic updates
  - System alerts
  - Marketing emails
- **Persistent Settings**
  - Settings saved per student
  - Default preferences for new students

### 4. Privacy Settings
- **Profile Visibility Control**
  - Public, Private, or Friends Only
- **Data Sharing Preferences**
  - Academic information sharing
  - Contact information sharing
  - Data analytics participation
  - Third-party sharing controls
- **Granular Controls**
  - Individual setting toggles
  - Clear descriptions for each option

### 5. Help & Support
- **FAQ Section**
  - Common questions and answers
  - Categorized help topics
  - Step-by-step guides
- **Contact Information**
  - Support email and phone
  - Office hours
  - Response time expectations
- **Support Ticket System**
  - Category-based request submission
  - Ticket tracking with unique IDs
  - Status updates and responses
- **Resource Links**
  - Student handbook
  - Video tutorials
  - System requirements
  - Troubleshooting guides

## Technical Implementation

### Database Schema

#### student_notification_settings
```sql
CREATE TABLE student_notification_settings (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    email_notifications BOOLEAN DEFAULT true,
    sms_notifications BOOLEAN DEFAULT false,
    push_notifications BOOLEAN DEFAULT true,
    fee_reminders BOOLEAN DEFAULT true,
    academic_updates BOOLEAN DEFAULT true,
    system_alerts BOOLEAN DEFAULT true,
    marketing_emails BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### support_requests
```sql
CREATE TABLE support_requests (
    id SERIAL PRIMARY KEY,
    ticket_id VARCHAR(50) UNIQUE NOT NULL,
    registration_number VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'open',
    admin_response TEXT,
    admin_id VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);
```

#### student_privacy_settings
```sql
CREATE TABLE student_privacy_settings (
    id SERIAL PRIMARY KEY,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    profile_visibility VARCHAR(20) DEFAULT 'private',
    share_academic_info BOOLEAN DEFAULT false,
    share_contact_info BOOLEAN DEFAULT false,
    data_analytics BOOLEAN DEFAULT true,
    third_party_sharing BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Endpoints

#### Profile Management
- `PUT /api/students/profile/[regNumber]` - Update student profile
- `POST /api/students/upload-photo` - Upload profile photo
- `POST /api/students/change-password` - Change password

#### Settings Management
- `GET /api/students/notification-settings` - Get notification preferences
- `POST /api/students/notification-settings` - Save notification preferences

#### Support System
- `POST /api/students/support-requests` - Submit support ticket
- `GET /api/students/support-requests` - Get student's support tickets

### Components

#### SettingsSection.tsx
Main settings component with tabbed interface:
- Profile Settings tab
- Password Change tab
- Notifications tab
- Privacy Settings tab
- Help & Support tab

#### Key Features:
- **Responsive Design**: Optimized for desktop and mobile
- **Form Validation**: Client-side and server-side validation
- **Error Handling**: Comprehensive error messages
- **Loading States**: Loading indicators during operations
- **Success Feedback**: Toast notifications for user actions

### UI/UX Design

#### KyU Portal Style Matching
- **Sidebar Navigation**: Vertical navigation with icons
- **Card-based Layout**: Clean, modern card components
- **Color Scheme**: Consistent with KyU branding
- **Typography**: Professional fonts and sizing
- **Interactive Elements**: Hover states and transitions

#### Responsive Features
- **Mobile-first Design**: Optimized for mobile devices
- **Flexible Layouts**: Grid and flexbox layouts
- **Touch-friendly**: Large touch targets
- **Accessibility**: ARIA labels and keyboard navigation

## Setup Instructions

### 1. Database Setup
```bash
# Run the settings schema script
psql -U your_username -d your_database -f scripts/create-settings-schema.sql
```

### 2. Environment Configuration
Ensure your environment variables are set:
```env
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. File Upload Configuration
Create upload directories:
```bash
mkdir -p public/uploads/student-photos
chmod 755 public/uploads/student-photos
```

### 4. CSS Import
The settings styles are automatically imported in `app/globals.css`:
```css
@import '../styles/settings.css';
```

## Usage Examples

### Basic Profile Update
```typescript
const updateProfile = async (profileData) => {
  const response = await fetch(`/api/students/profile/${regNumber}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  });
  return response.json();
};
```

### Photo Upload
```typescript
const uploadPhoto = async (file, regNumber) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('registrationNumber', regNumber);
  
  const response = await fetch('/api/students/upload-photo', {
    method: 'POST',
    body: formData
  });
  return response.json();
};
```

### Submit Support Request
```typescript
const submitSupportRequest = async (requestData) => {
  const response = await fetch('/api/students/support-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData)
  });
  return response.json();
};
```

## Security Considerations

### Data Protection
- **Input Sanitization**: All user inputs are sanitized
- **File Upload Security**: File type and size validation
- **Password Security**: Bcrypt hashing for password storage
- **SQL Injection Prevention**: Parameterized queries

### Access Control
- **Authentication Required**: All endpoints require valid student authentication
- **Authorization**: Students can only access their own data
- **Rate Limiting**: API rate limiting to prevent abuse

### Privacy Compliance
- **Data Minimization**: Only collect necessary information
- **User Consent**: Clear consent for data usage
- **Data Retention**: Configurable data retention policies

## Testing

### Unit Tests
```bash
# Run component tests
npm test SettingsSection

# Run API endpoint tests
npm test api/students/profile
```

### Integration Tests
```bash
# Test complete settings flow
npm run test:integration settings
```

### Manual Testing Checklist
- [ ] Profile information updates correctly
- [ ] Photo upload works with valid files
- [ ] Password change with proper validation
- [ ] Notification settings save and persist
- [ ] Support ticket submission
- [ ] Responsive design on mobile
- [ ] Error handling for invalid inputs
- [ ] Loading states during operations

## Troubleshooting

### Common Issues

1. **Profile Update Fails**
   - Check database connection
   - Verify student exists in database
   - Ensure all required fields are provided

2. **Photo Upload Errors**
   - Check file permissions on upload directory
   - Verify file size and type restrictions
   - Ensure adequate disk space

3. **Password Change Issues**
   - Verify current password authentication
   - Check password strength requirements
   - Ensure bcrypt is properly installed

4. **Notification Settings Not Saving**
   - Check database table exists
   - Verify foreign key constraints
   - Ensure proper data types

### Debug Commands

```bash
# Check database tables
psql -d your_database -c "SELECT * FROM student_notification_settings LIMIT 5;"

# Test API endpoints
curl -X GET "http://localhost:3000/api/students/profile/CS/001/2024"

# Check file upload directory
ls -la public/uploads/student-photos/
```

## Future Enhancements

### Planned Features
1. **Advanced Privacy Controls**
   - Data export functionality
   - Account deletion requests
   - Privacy audit logs

2. **Enhanced Support System**
   - Live chat integration
   - Video call support
   - AI-powered FAQ search

3. **Notification Improvements**
   - Real-time notifications
   - Email templates
   - SMS integration

4. **Profile Enhancements**
   - Social media links
   - Academic achievements
   - Skill endorsements

### Technical Improvements
- **Performance Optimization**: Lazy loading and caching
- **Accessibility**: WCAG 2.1 compliance
- **Internationalization**: Multi-language support
- **API Documentation**: OpenAPI/Swagger integration

## Conclusion

The Enhanced Settings System provides a comprehensive, secure, and user-friendly interface for students to manage their profile, preferences, and support needs. The system is designed to be scalable, maintainable, and aligned with modern web development best practices.

For questions or support, contact the development team at dev@clips.edu.
