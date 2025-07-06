#!/bin/bash
# Setup script for PDF generation

echo "Setting up PDF generation requirements..."

# Install Puppeteer Chrome browser
echo "Installing Chrome browser for Puppeteer..."
if command -v npx &> /dev/null; then
    npx puppeteer browsers install chrome
elif command -v pnpm &> /dev/null; then
    pnpm dlx puppeteer browsers install chrome
elif command -v npm &> /dev/null; then
    npm exec puppeteer browsers install chrome
else
    echo "Error: No package manager found (npm, pnpm, or npx)"
    exit 1
fi

echo "Chrome browser installed successfully!"
echo "PDF generation is now ready to use."
