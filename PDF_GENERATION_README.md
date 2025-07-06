# PDF Generation System

This system provides automated PDF generation for student documents including exam cards and fee statements.

## Features

- **Exam Card PDF Generation**: Creates professional exam cards with student information and registered units
- **Fee Statement PDF Generation**: Generates detailed fee statements with payment history
- **Enhanced Error Handling**: Graceful error handling with user-friendly messages
- **Validation**: Pre-generation validation of student data
- **Batch Generation**: Generate multiple documents simultaneously

## Setup

### Prerequisites
- Node.js and npm/pnpm installed
- Puppeteer Chrome browser installed

### Installation

1. **Install Chrome browser for Puppeteer:**
   ```bash
   # Using npm
   npx puppeteer browsers install chrome
   
   # Using pnpm
   pnpm dlx puppeteer browsers install chrome
   
   # Or run the setup script
   ./setup-pdf.bat  # Windows
   ./setup-pdf.sh   # Linux/Mac
   ```

2. **Verify installation:**
   ```bash
   npm run dev
   ```

## Usage

### API Endpoints

#### Generate Exam Card PDF
```http
POST /api/generate-pdf/exam-card
Content-Type: application/json

{
  "studentData": {
    "name": "John Doe",
    "registration_number": "STU20251198",
    "course": "Computer Science",
    "level_of_study": "Diploma"
  },
  "units": [
    {
      "code": "CS101",
      "name": "Introduction to Programming"
    }
  ]
}
```

#### Generate Fee Statement PDF
```http
POST /api/generate-pdf/fee-statement
Content-Type: application/json

{
  "studentData": {
    "name": "John Doe",
    "registration_number": "STU20251198",
    "course": "Computer Science",
    "level_of_study": "Diploma"
  },
  "feeData": {
    "semester_fee": 150000,
    "total_paid": 100000,
    "fee_balance": 50000,
    "session_progress": 67,
    "fees": [...],
    "payments": [...]
  }
}
```

### React Components

#### Document Generator Component
```tsx
import { DocumentGenerator } from '@/components/student/DocumentGenerator'

<DocumentGenerator 
  studentData={{
    name: "John Doe",
    registration_number: "STU20251198",
    course: "Computer Science",
    level_of_study: "Diploma"
  }}
/>
```

#### Quick Document Generator
```tsx
import { QuickDocumentGenerator } from '@/components/student/QuickDocumentGenerator'

<QuickDocumentGenerator 
  registrationNumber="STU20251198"
  className="my-custom-class"
/>
```

#### Document Generation Hook
```tsx
import { useDocumentGeneration } from '@/components/student/QuickDocumentGenerator'

function MyComponent() {
  const { generateExamCard, generateFeeStatement, isGenerating } = useDocumentGeneration('STU20251198')
  
  return (
    <div>
      <button onClick={generateExamCard} disabled={isGenerating}>
        Generate Exam Card
      </button>
      <button onClick={generateFeeStatement} disabled={isGenerating}>
        Generate Fee Statement
      </button>
    </div>
  )
}
```

### Utility Functions

#### Generate Documents with Validation
```typescript
import { generateExamCardWithValidation, generateFeeStatementWithValidation } from '@/lib/document-generator'

// Generate exam card with validation
const result = await generateExamCardWithValidation('STU20251198')
if (result.success) {
  console.log('Exam card generated successfully')
} else {
  console.error('Error:', result.error)
}

// Generate fee statement with validation
const result2 = await generateFeeStatementWithValidation('STU20251198')
if (result2.success) {
  console.log('Fee statement generated successfully')
} else {
  console.error('Error:', result2.error)
}
```

#### Generate Both Documents
```typescript
import { generateStudentDocuments } from '@/lib/document-generator'

const results = await generateStudentDocuments('STU20251198')
console.log('Exam card:', results.examCard)
console.log('Fee statement:', results.feeStatement)
```

#### Validate Student Data
```typescript
import { validateStudentForDocuments } from '@/lib/document-generator'

const validation = await validateStudentForDocuments('STU20251198')
if (validation.isValid) {
  console.log('Student data is valid')
} else {
  console.error('Validation failed:', validation.message)
}
```

## Troubleshooting

### Common Issues

1. **"Chrome browser not found" Error**
   - Run: `npx puppeteer browsers install chrome`
   - Or use the setup script: `./setup-pdf.bat`

2. **PDF Generation Fails**
   - Check if student data exists in the database
   - Verify API endpoints are working
   - Check server logs for detailed error messages

3. **Empty PDF or Missing Data**
   - Verify student registration number is correct
   - Check if fee data exists for the student
   - Ensure units are registered for exam card generation

### Debug Steps

1. **Check API Endpoints:**
   ```bash
   curl http://localhost:3000/api/students/profile/STU20251198
   curl http://localhost:3000/api/students/fees/STU20251198
   curl http://localhost:3000/api/students/generate-exam-card/STU20251198
   ```

2. **Check Browser Console:**
   - Open Developer Tools
   - Look for network errors
   - Check API response data

3. **Check Server Logs:**
   - Look for Puppeteer errors
   - Check PDF generation logs
   - Verify database connections

## File Structure

```
lib/
├── pdf-generator.ts          # Main PDF generation class
├── document-generator.ts     # High-level document generation functions

app/api/generate-pdf/
├── exam-card/route.ts        # Exam card PDF API
├── fee-statement/route.ts    # Fee statement PDF API

components/student/
├── DocumentGenerator.tsx     # Full-featured document generator
├── QuickDocumentGenerator.tsx # Simple document generator
```

## Configuration

### Puppeteer Configuration
The system uses Puppeteer with the following default settings:
- Headless mode: `true`
- Args: `['--no-sandbox', '--disable-setuid-sandbox']`
- Format: `A4`
- Margins: `20px` on all sides

### PDF Settings
- **Format**: A4
- **Background**: Enabled
- **Margins**: 20px (configurable)
- **Font**: Arial, sans-serif
- **Colors**: Professional blue/gray theme

## Contributing

1. Fork the repository
2. Create your feature branch
3. Test PDF generation thoroughly
4. Submit a pull request

## License

This project is licensed under the MIT License.
