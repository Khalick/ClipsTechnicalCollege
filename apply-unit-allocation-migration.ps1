#!/usr/bin/env pwsh

# PowerShell script to apply the unit allocations table migration
# This script will show you what needs to be done in Supabase

Write-Host "========================================" -ForegroundColor Green
Write-Host "CLIPSTECH - Unit Allocation Migration" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "INSTRUCTIONS:" -ForegroundColor Yellow
Write-Host "1. Open your Supabase project dashboard" -ForegroundColor White
Write-Host "2. Go to the SQL Editor" -ForegroundColor White
Write-Host "3. Copy and paste the SQL below" -ForegroundColor White
Write-Host "4. Run the SQL to create the missing table" -ForegroundColor White
Write-Host ""
Write-Host "SQL TO RUN:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

Get-Content "scripts/add-unit-allocations-table.sql" | ForEach-Object {
    Write-Host $_ -ForegroundColor White
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "After running the SQL, restart your Next.js application" -ForegroundColor Yellow
Write-Host "The unit allocation system will then work properly!" -ForegroundColor Green
