# Check Fee System Status
# This script checks if the fee management system is properly configured

Write-Host "Checking Fee Management System Status..." -ForegroundColor Green

# Check if required files exist
$requiredFiles = @(
    "app\api\students\fees\[regNumber]\route.ts",
    "app\api\finance\record-payment\route.ts",
    "app\api\admin\fees\route.ts",
    "components\student\FeeInformation.tsx",
    "scripts\add-sample-fee-data.sql"
)

Write-Host "`nChecking required files:" -ForegroundColor Blue
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file" -ForegroundColor Red
    }
}

# Check if environment is configured
Write-Host "`nChecking environment configuration:" -ForegroundColor Blue
if (Test-Path ".env.local") {
    Write-Host "✓ .env.local exists" -ForegroundColor Green
    
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "✓ Supabase URL configured" -ForegroundColor Green
    } else {
        Write-Host "✗ Supabase URL not found in .env.local" -ForegroundColor Red
    }
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "✓ Supabase Anon Key configured" -ForegroundColor Green
    } else {
        Write-Host "✗ Supabase Anon Key not found in .env.local" -ForegroundColor Red
    }
} else {
    Write-Host "✗ .env.local not found" -ForegroundColor Red
}

# Check database schema files
Write-Host "`nChecking database schema files:" -ForegroundColor Blue
$schemaFiles = @(
    "scripts\create-database-schema.sql",
    "scripts\supabase-schema.sql"
)

foreach ($file in $schemaFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file" -ForegroundColor Red
    }
}

# Check if Next.js dependencies are installed
Write-Host "`nChecking dependencies:" -ForegroundColor Blue
if (Test-Path "node_modules") {
    Write-Host "✓ Node modules installed" -ForegroundColor Green
} else {
    Write-Host "✗ Node modules not installed. Run 'npm install'" -ForegroundColor Red
}

if (Test-Path "package.json") {
    Write-Host "✓ package.json exists" -ForegroundColor Green
} else {
    Write-Host "✗ package.json not found" -ForegroundColor Red
}

Write-Host "`nFee Management System Components:" -ForegroundColor Green
Write-Host "- Database tables: fees, fee_payments" -ForegroundColor White
Write-Host "- API endpoints: /api/students/fees/[regNumber], /api/finance/record-payment" -ForegroundColor White
Write-Host "- UI components: FeeInformation, FeesManagementForm" -ForegroundColor White
Write-Host "- Sample data: scripts/add-sample-fee-data.sql" -ForegroundColor White

Write-Host "`nNext steps:" -ForegroundColor Green
Write-Host "1. Run the SQL script in Supabase to add sample data" -ForegroundColor White
Write-Host "2. Start the development server: npm run dev" -ForegroundColor White
Write-Host "3. Test the fee system with student login" -ForegroundColor White

Write-Host "`nStatus check complete!" -ForegroundColor Green
