# Test Student Profile API
# This script tests the student profile API endpoint to ensure it returns real data

Write-Host "Testing Student Profile API..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Set base URL (adjust if your server runs on a different port)
$baseUrl = "http://localhost:3000"

# Test registration numbers from sample data
$testRegNumbers = @(
    "CS/001/2024",
    "CS/002/2024", 
    "IT/001/2024",
    "CS/003/2024",
    "IT/002/2024"
)

foreach ($regNumber in $testRegNumbers) {
    Write-Host "`nTesting registration number: $regNumber" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/students/profile/$regNumber" -Method GET -ErrorAction Stop
        
        if ($response.success) {
            Write-Host "✓ SUCCESS: Student profile retrieved" -ForegroundColor Green
            Write-Host "  Name: $($response.data.name)"
            Write-Host "  Email: $($response.data.email)"
            Write-Host "  Course: $($response.data.course)"
            Write-Host "  Level: $($response.data.level_of_study)"
            Write-Host "  Status: $($response.data.status)"
            Write-Host "  DOB: $($response.data.date_of_birth)"
        } else {
            Write-Host "✗ FAILED: $($response.error)" -ForegroundColor Red
        }
    } catch {
        Write-Host "✗ ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "Testing complete!" -ForegroundColor Green
Write-Host "`nNOTE: Make sure your Next.js development server is running on port 3000" -ForegroundColor Cyan
Write-Host "Run: npm run dev" -ForegroundColor Cyan
