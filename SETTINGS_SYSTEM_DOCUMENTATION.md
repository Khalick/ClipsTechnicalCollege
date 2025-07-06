# Enhanced Settings System Documentation

## Overview
The enhanced settings system provides a comprehensive KyU-style settings interface for students with multiple navigation tabs and full API integration.

## Components

### SettingsSection Component
- **Location**: `components/student/SettingsSection.tsx`
- **Features**:
  - Sidebar navigation with multiple tabs
  - Profile settings with photo upload
  - Password change functionality
  - Notification preferences
  - Privacy settings
  - Help & Support with ticket system

### Settings Navigation Tabs

#### 1. Profile Settings
- Edit personal information
- Upload profile picture
- Update contact details
- Emergency contact management
- Next of kin information

#### 2. Change Password
- Current password verification
- New password with strength requirements
- Confirm password validation
- Password requirements display

#### 3. Notifications
- Email notification preferences
- SMS notification settings
- Push notification controls
- Fee reminder settings
- Academic update preferences
- System alerts configuration
- Marketing email opt-in/out

#### 4. Privacy Settings
- Profile visibility controls
- Academic information sharing
- Contact information sharing
- Data analytics permissions
- Third-party data sharing

#### 5. Help & Support
- FAQ section
- Contact information
- Support ticket submission
- Ticket history viewing
- Resource links

## API Routes

### Profile Management
- **GET/PUT** `/api/students/profile/[regNumber]`
  - Fetch and update student profile information
  - Handles all personal information fields

### Password Management
- **POST** `/api/students/change-password`
  - Change student password
  - Validates current password
  - Enforces password strength requirements

### Photo Upload
- **POST** `/api/students/upload-photo`
  - Upload and update profile picture
  - File type and size validation
  - Automatic file naming and storage

### Notification Settings
- **GET/PUT** `/api/students/notifications`
  - Fetch and update notification preferences
  - Supports all notification types
  - Default settings for new users

### Privacy Settings
- **GET/PUT** `/api/students/privacy-settings`
  - Manage privacy preferences
  - Profile visibility controls
  - Data sharing permissions

### Support System
- **GET/POST** `/api/students/support`
  - Create and retrieve support tickets
  - Category-based ticket organization
  - Priority levels and status tracking

## Database Schema

### Tables Created
1. **student_notification_settings**
   - Stores notification preferences per student
   - Boolean flags for different notification types
   - Unique constraint on registration_number

2. **student_privacy_settings**
   - Manages privacy preferences
   - Profile visibility controls
   - Data sharing permissions
   - Unique constraint on registration_number

3. **support_tickets**
   - Support ticket management system
   - Category, priority, and status tracking
   - Admin assignment and notes
   - Timestamps for creation and resolution

### Sample Data
- Default notification settings for common use cases
- Privacy settings with secure defaults
- Sample support tickets for testing

## Features

### Responsive Design
- Mobile-first responsive layout
- Collapsible sidebar navigation
- Touch-friendly interface
- Optimized for all screen sizes

### User Experience
- Intuitive navigation
- Real-time form validation
- Loading states and error handling
- Success/error toast notifications
- Auto-save functionality where appropriate

### Security Features
- Password strength requirements
- File upload validation
- Input sanitization
- Secure default privacy settings
- CSRF protection

### Accessibility
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme
- Focus indicators
- ARIA labels and descriptions

## Integration

### With Dashboard
- Seamlessly integrated into ModernStudentDashboard
- Sidebar navigation consistency
- Shared user authentication
- Unified styling approach

### With Other Sections
- Consistent with Academics, Finance, and Clearance sections
- Shared API patterns
- Common error handling
- Unified toast notification system

## File Structure
```
components/student/
├── SettingsSection.tsx          # Main settings component
├── ModernStudentDashboard.tsx   # Dashboard integration

app/api/students/
├── profile/[regNumber]/route.ts # Profile management
├── change-password/route.ts     # Password change
├── upload-photo/route.ts        # Photo upload
├── notifications/route.ts       # Notification settings
├── privacy-settings/route.ts    # Privacy settings
└── support/route.ts             # Support system

styles/
└── settings.css                 # Settings-specific styles

scripts/
└── create-enhanced-settings-schema.sql  # Database setup
```

## Usage Examples

### Basic Settings Navigation
```tsx
<SettingsSection 
  studentData={studentData}
  onStudentDataChange={setStudentData}
  user={user}
/>
```

### API Integration
```typescript
// Update notification settings
const response = await fetch('/api/students/notifications', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    registrationNumber: user.registrationNumber,
    email_notifications: true,
    fee_reminders: true,
    // ... other settings
  })
})
```

### Database Setup
```sql
-- Run the schema creation script
\i scripts/create-enhanced-settings-schema.sql
```

## Testing

### Manual Testing
1. Navigate to Settings section
2. Test each tab functionality
3. Verify form submissions
4. Check responsive behavior
5. Test file upload limits

### API Testing
- Use Postman or similar tool
- Test all CRUD operations
- Verify error handling
- Check authentication requirements

## Future Enhancements

### Planned Features
- Two-factor authentication setup
- Backup and export data
- Theme preferences
- Language settings
- Notification scheduling

### Technical Improvements
- Real-time notifications
- WebSocket integration
- Advanced file management
- Bulk operations
- Audit logging

## Troubleshooting

### Common Issues
1. **Photo upload fails**: Check file size (5MB limit) and format (JPEG, PNG, GIF)
2. **Settings not saving**: Verify network connection and authentication
3. **Responsive issues**: Clear browser cache and test in incognito mode

### Debug Information
- Check browser console for errors
- Verify API response status codes
- Ensure database tables exist
- Check file permissions for uploads

## Maintenance

### Regular Tasks
- Monitor support ticket volumes
- Update FAQ content
- Review privacy settings usage
- Optimize file storage
- Update documentation

### Performance Monitoring
- Track API response times
- Monitor database query performance
- Check file upload success rates
- Analyze user engagement metrics
