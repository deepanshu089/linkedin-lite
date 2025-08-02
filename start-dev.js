#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Mini LinkedIn Community Platform in development mode...\n');

// Start server
console.log('📡 Starting backend server...');
const server = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'inherit',
  shell: true
});

// Wait a bit for server to start, then start client
setTimeout(() => {
  console.log('🌐 Starting frontend client...');
  const client = spawn('npm', ['run', 'dev'], {
    cwd: path.join(__dirname, 'client'),
    stdio: 'inherit',
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    server.kill();
    client.kill();
    process.exit();
  });

  client.on('close', (code) => {
    console.log(`Frontend process exited with code ${code}`);
    server.kill();
  });
}, 3000);

server.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  server.kill();
  process.exit();
}); 