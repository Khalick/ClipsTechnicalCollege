#!/bin/bash

echo "Installing CLIPS College Portal Dependencies..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Please install PostgreSQL first:"
    echo "  - macOS: brew install postgresql"
    echo "  - Ubuntu: sudo apt install postgresql postgresql-contrib"
    echo "  - Windows: Download from https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ Node.js and PostgreSQL are installed"

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p uploads/photos uploads/exam-card uploads/fees-structure
chmod 755 uploads

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚙️  Creating .env.local from example..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your database credentials"
fi

echo "✅ Dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local with your PostgreSQL credentials"
echo "2. Create database: npm run db:create"
echo "3. Set up schema: npm run db:setup"
echo "4. Start development: npm run dev"
