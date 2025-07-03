#!/bin/bash

echo "🎵 Melodex MERN Migration Setup"
echo "================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Backend setup
echo ""
echo "🔧 Setting up Backend..."
cd melodex-backend

if [ ! -f "package.json" ]; then
    echo "❌ Backend package.json not found. Please ensure melodex-backend directory exists."
    exit 1
fi

echo "📦 Installing backend dependencies..."
npm install

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please update .env with your actual values:"
    echo "   - SPOTIFY_CLIENT_ID"
    echo "   - SPOTIFY_CLIENT_SECRET"
    echo "   - MONGODB_URI"
    echo "   - JWT_SECRET"
else
    echo "✅ .env file exists"
fi

cd ..

# Frontend setup
echo ""
echo "🎨 Setting up Frontend..."
cd Melodex

if [ ! -f "package.json" ]; then
    echo "❌ Frontend package.json not found."
    exit 1
fi

echo "📦 Installing frontend dependencies..."
npm install

# Check if Firebase is still in dependencies
if grep -q "firebase" package.json; then
    echo "⚠️  Firebase dependency found. Removing..."
    npm uninstall firebase
fi

echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next steps:"
echo "1. Update melodex-backend/.env with your actual values"
echo "2. Start MongoDB (local or Atlas)"
echo "3. Start backend: cd melodex-backend && npm run dev"
echo "4. Start frontend: cd Melodex && npm run dev"
echo "5. Test the application at http://localhost:5173"
echo ""
echo "📚 See MERN_MIGRATION_README.md for detailed instructions" 