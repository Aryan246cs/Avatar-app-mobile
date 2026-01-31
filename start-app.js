const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Avatar App...\n');

// Start backend
console.log('📡 Starting backend server...');
const backend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'backend'),
  stdio: 'pipe',
  shell: true
});

backend.stdout.on('data', (data) => {
  console.log(`[BACKEND] ${data.toString().trim()}`);
});

backend.stderr.on('data', (data) => {
  console.log(`[BACKEND ERROR] ${data.toString().trim()}`);
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
  console.log('\n📱 Starting React Native app...');
  const frontend = spawn('npx', ['expo', 'start'], {
    stdio: 'inherit', // This will show the QR code properly
    shell: true
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down...');
    backend.kill();
    frontend.kill();
    process.exit();
  });

}, 3000); // Wait 3 seconds for backend to start