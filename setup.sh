#!/bin/bash

set -e

echo "========================================"
echo "Job Application CRM - Setup Script"
echo "========================================"
echo ""

# Check prerequisites
echo "Checking prerequisites..."
if ! command -v python3 &> /dev/null; then
  echo "❌ Python 3 is required but not installed. Please install Python 3.11 or higher."
  exit 1
fi

if ! command -v node &> /dev/null; then
  echo "❌ Node.js is required but not installed. Please install Node.js 16 or higher."
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo "❌ npm is required but not installed."
  exit 1
fi

echo "✓ Python 3 installed: $(python3 --version)"
echo "✓ Node.js installed: $(node --version)"
echo "✓ npm installed: $(npm --version)"
echo ""

# Create .env from .env.example
echo "Setting up environment variables..."
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    echo "✓ Created .env from .env.example"
  else
    echo "⚠ .env.example not found, skipping"
  fi
else
  echo "✓ .env already exists"
fi

# Create logs directory
echo ""
echo "Creating logs directory..."
mkdir -p logs
echo "✓ logs/ directory created"

# Install Python dependencies
echo ""
echo "Installing Python dependencies..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r backend/requirements.txt
echo "✓ Python dependencies installed"

# Initialize SQLite database
echo ""
echo "Initializing SQLite database..."
python3 backend/models.py
echo "✓ SQLite database initialized"

# Install Node dependencies
echo ""
echo "Installing Node.js dependencies..."
cd frontend
npm install
cd ..
echo "✓ Node dependencies installed"

# API Keys setup
echo ""
echo "========================================"
echo "API Keys Setup"
echo "========================================"
echo ""
echo "You'll need two API keys to run this application:"
echo ""
echo "1. MICROSOFT GRAPH API KEY (for Outlook email)"
echo "   - Visit: https://portal.azure.com"
echo "   - Create a new app registration"
echo "   - Configure for personal Microsoft accounts (sign in)"
echo "   - Create a client secret"
echo "   - Copy the Client ID and Client Secret to .env"
echo ""
echo "2. GOOGLE GEMINI API KEY (for email classification)"
echo "   - Visit: https://ai.google.dev"
echo "   - Get a free API key for gemini-1.5-flash"
echo "   - Copy the key to .env as GEMINI_API_KEY"
echo ""
echo "Edit .env and add these values:"
echo "  - MICROSOFT_CLIENT_ID"
echo "  - MICROSOFT_CLIENT_SECRET"
echo "  - GEMINI_API_KEY"
echo ""
echo "Need detailed instructions? See README.md"
echo ""
read -p "Press Enter once you've added your API keys to .env..."

echo ""
echo "========================================"
echo "✓ Setup Complete!"
echo "========================================"
echo ""
echo "To run the application:"
echo ""
echo "  # Terminal 1 (Backend)"
echo "  source venv/bin/activate"
echo "  cd backend && python app.py"
echo ""
echo "  # Terminal 2 (Frontend)"
echo "  cd frontend && npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
