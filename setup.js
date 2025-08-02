#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Mini LinkedIn Community Platform...\n');

// Create .env files
console.log('📝 Creating environment files...');

// Server .env
const serverEnvPath = path.join(__dirname, 'server', '.env');
if (!fs.existsSync(serverEnvPath)) {
  const serverEnvContent = `# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/mini-linkedin

# JWT Secret Key (generate a strong secret in production)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Server Port
PORT=5000

# Environment
NODE_ENV=development
`;
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  console.log('✅ Created server/.env');
} else {
  console.log('ℹ️  server/.env already exists');
}

// Client .env
const clientEnvPath = path.join(__dirname, 'client', '.env');
if (!fs.existsSync(clientEnvPath)) {
  const clientEnvContent = `# Backend API URL
VITE_API_URL=http://localhost:5000/api
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log('✅ Created client/.env');
} else {
  console.log('ℹ️  client/.env already exists');
}

console.log('\n📦 Installing dependencies...');

// Install server dependencies
console.log('Installing server dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'server'), stdio: 'inherit' });
  console.log('✅ Server dependencies installed');
} catch (error) {
  console.error('❌ Failed to install server dependencies');
}

// Install client dependencies
console.log('Installing client dependencies...');
try {
  execSync('npm install', { cwd: path.join(__dirname, 'client'), stdio: 'inherit' });
  console.log('✅ Client dependencies installed');
} catch (error) {
  console.error('❌ Failed to install client dependencies');
}

console.log('\n🎉 Setup complete!');
console.log('\n📋 Next steps:');
console.log('1. Start MongoDB (make sure it\'s running on localhost:27017)');
console.log('2. Start the server: cd server && npm run dev');
console.log('3. Start the client: cd client && npm run dev');
console.log('4. Open http://localhost:3000 in your browser');
console.log('\n🔑 Demo credentials:');
console.log('Email: john.doe@example.com');
console.log('Password: password123');
console.log('\n📚 Check README.md for more details'); 