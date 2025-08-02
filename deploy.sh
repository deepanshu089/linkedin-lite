#!/bin/bash

# 🚀 Cyaan Deployment Script
# This script helps you prepare and deploy your Cyaan application

echo "🚀 Cyaan Deployment Script"
echo "=========================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git repository not found. Please initialize git first:"
    echo "   git init"
    echo "   git add ."
    echo "   git commit -m 'Initial commit'"
    exit 1
fi

# Check if .env files exist
echo "📋 Checking environment files..."

if [ ! -f "client/.env" ]; then
    echo "⚠️  client/.env not found. Creating template..."
    cat > client/.env << EOF
# Frontend Environment Variables
REACT_APP_API_URL=http://localhost:5000
EOF
    echo "✅ Created client/.env template"
fi

if [ ! -f "server/.env" ]; then
    echo "⚠️  server/.env not found. Creating template..."
    cat > server/.env << EOF
# Backend Environment Variables
MONGODB_URI=mongodb://localhost:27017/cyaan
JWT_SECRET=your_secure_jwt_secret_key_here
PORT=5000
NODE_ENV=development
EOF
    echo "✅ Created server/.env template"
fi

# Check if dependencies are installed
echo "📦 Checking dependencies..."

if [ ! -d "client/node_modules" ]; then
    echo "📦 Installing client dependencies..."
    cd client && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 Installing server dependencies..."
    cd server && npm install && cd ..
fi

# Build the application
echo "🔨 Building application..."
cd client && npm run build && cd ..

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please check for errors."
    exit 1
fi

# Git status
echo "📊 Git Status:"
git status --porcelain

# Ask if user wants to commit changes
read -p "🤔 Do you want to commit and push changes? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Committing changes..."
    git add .
    git commit -m "🚀 Prepare for deployment"
    
    echo "📤 Pushing to remote..."
    git push origin main
    
    echo "✅ Changes pushed successfully!"
    echo ""
    echo "🎉 Next Steps:"
    echo "1. Deploy backend to Railway/Render/Heroku"
    echo "2. Deploy frontend to Vercel/Netlify"
    echo "3. Set up environment variables in your hosting platform"
    echo "4. Test your deployed application"
    echo ""
    echo "📖 See DEPLOYMENT.md for detailed instructions"
else
    echo "📝 Skipping commit. You can commit manually later."
fi

echo ""
echo "🎯 Deployment Checklist:"
echo "□ Set up MongoDB Atlas or Railway MongoDB"
echo "□ Deploy backend and get URL"
echo "□ Update REACT_APP_API_URL in frontend"
echo "□ Deploy frontend"
echo "□ Test all features"
echo "□ Set up monitoring and analytics"
echo ""
echo "📚 For detailed instructions, see DEPLOYMENT.md" 