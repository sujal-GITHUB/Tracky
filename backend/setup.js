#!/usr/bin/env node

/**
 * Setup script for Tracky Backend
 * This script helps set up the development environment
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Setting up Tracky Order Management Backend...\n');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env file from template...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env file created successfully');
  } else {
    console.log('⚠️  env.example file not found');
  }
} else {
  console.log('✅ .env file already exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('\n📦 Installing dependencies...');
  console.log('Run: npm install');
} else {
  console.log('✅ Dependencies already installed');
}

console.log('\n📋 Next steps:');
console.log('1. Install dependencies: npm install');
console.log('2. Start MongoDB service');
console.log('3. Update .env file with your configuration');
console.log('4. Start the server: npm run dev');
console.log('5. Test the API: npm run demo');

console.log('\n🔧 Available commands:');
console.log('- npm start          # Start production server');
console.log('- npm run dev        # Start development server');
console.log('- npm test           # Run tests');
console.log('- npm run demo       # Run API demo');
console.log('- npm run generate-token # Generate JWT tokens');

console.log('\n📚 API Documentation:');
console.log('- Health Check: GET /api/orders/health');
console.log('- Create Order: POST /api/orders');
console.log('- Get Orders: GET /api/orders');
console.log('- Search: GET /api/orders/search?q=query');
console.log('- Statistics: GET /api/orders/statistics');

console.log('\n🎉 Setup complete! Happy coding!');
