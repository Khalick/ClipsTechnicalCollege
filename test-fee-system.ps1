#!/usr/bin/env pwsh

# Fee Management System Test Script
# This script helps test the fee management system

Write-Host "============================================" -ForegroundColor Green
Write-Host "FEE MANAGEMENT SYSTEM - TESTING SCRIPT" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 TESTING STEPS:" -ForegroundColor Yellow
Write-Host ""

Write-Host "1. DATABASE SETUP:" -ForegroundColor Cyan
Write-Host "   → Copy scripts/setup-fees-tables.sql" -ForegroundColor White
Write-Host "   → Run in Supabase SQL Editor" -ForegroundColor White
Write-Host "   → This creates fees and fee_payments tables with sample data" -ForegroundColor White
Write-Host ""

Write-Host "2. API TESTING:" -ForegroundColor Cyan
Write-Host "   → Test the fees API endpoint" -ForegroundColor White
Write-Host "   → Open browser and navigate to:" -ForegroundColor White
Write-Host "     http://localhost:3000/api/students/fees/REG001" -ForegroundColor Gray
Write-Host "   → Should return JSON with fee data" -ForegroundColor White
Write-Host ""

Write-Host "3. COMPONENT TESTING:" -ForegroundColor Cyan
Write-Host "   → Login as a student" -ForegroundColor White
Write-Host "   → Check browser console for API calls" -ForegroundColor White
Write-Host "   → Verify fee cards display real data" -ForegroundColor White
Write-Host ""

Write-Host "📊 SAMPLE TEST DATA:" -ForegroundColor Magenta
Write-Host "Student ID 10 (REG001):" -ForegroundColor White
Write-Host "  • Total Billed: KSh. 56,120.00" -ForegroundColor Gray
Write-Host "  • Total Paid: KSh. 42,800.00" -ForegroundColor Gray
Write-Host "  • Balance: KSh. 13,320.00" -ForegroundColor Gray
Write-Host ""

Write-Host "🐛 TROUBLESHOOTING:" -ForegroundColor Red
Write-Host ""
Write-Host "If you see errors:" -ForegroundColor White
Write-Host "  1. Check browser console for JavaScript errors" -ForegroundColor Gray
Write-Host "  2. Verify Supabase connection in .env.local" -ForegroundColor Gray
Write-Host "  3. Ensure fees tables exist in database" -ForegroundColor Gray
Write-Host "  4. Check API endpoint responds correctly" -ForegroundColor Gray
Write-Host ""

Write-Host "🔧 ENVIRONMENT CHECK:" -ForegroundColor Yellow
if (Test-Path ".env.local") {
    Write-Host "  ✅ .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ .env.local file missing" -ForegroundColor Red
    Write-Host "     Create .env.local with your Supabase credentials" -ForegroundColor Gray
}

if (Test-Path "scripts/setup-fees-tables.sql") {
    Write-Host "  ✅ Fee setup script exists" -ForegroundColor Green
} else {
    Write-Host "  ❌ Fee setup script missing" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 TO START TESTING:" -ForegroundColor Green
Write-Host "1. Run the SQL script in Supabase" -ForegroundColor White
Write-Host "2. Start dev server: npm run dev" -ForegroundColor White
Write-Host "3. Login as student with registration: REG001" -ForegroundColor White
Write-Host "4. Check fee cards display real data" -ForegroundColor White
Write-Host ""

Write-Host "Fee management system is ready for testing!" -ForegroundColor Green
