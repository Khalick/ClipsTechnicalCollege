@echo off
REM Setup script for PDF generation on Windows

echo Setting up PDF generation requirements...

REM Install Puppeteer Chrome browser
echo Installing Chrome browser for Puppeteer...

REM Try different package managers
where npx >nul 2>nul
if %errorlevel% equ 0 (
    echo Using npx...
    npx puppeteer browsers install chrome
    goto :success
)

where pnpm >nul 2>nul
if %errorlevel% equ 0 (
    echo Using pnpm...
    pnpm dlx puppeteer browsers install chrome
    goto :success
)

where npm >nul 2>nul
if %errorlevel% equ 0 (
    echo Using npm...
    npm exec puppeteer browsers install chrome
    goto :success
)

echo Error: No package manager found (npm, pnpm, or npx)
exit /b 1

:success
echo Chrome browser installed successfully!
echo PDF generation is now ready to use.
pause
