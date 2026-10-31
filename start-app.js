const { spawn } = require('child_process');
const net = require('net');
const path = require('path');

console.log('🚀 Starting Avatar App...\n');

function isPortInUse(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(600);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('timeout', () => { socket.destroy(); resolve(false); });
    socket.once('error', () => resolve(false));
  });
}

const children = [];

function launch(label, command, args, cwd, stdio = 'pipe') {
  const child = spawn(command, args, { cwd, stdio, shell: process.platform === 'win32' });
  children.push(child);
  if (stdio === 'pipe') {
    child.stdout?.on('data', data => process.stdout.write(`[${label}] ${data}`));
    child.stderr?.on('data', data => process.stderr.write(`[${label} ERROR] ${data}`));
  }
  child.once('error', error => console.error(`[${label}] Could not start: ${error.message}`));
  child.once('exit', (code, signal) => {
    if (code && code !== 0) console.error(`[${label}] exited (${signal || `code ${code}`}).`);
  });
  return child;
}

async function startService(label, port, cwd) {
  if (await isPortInUse(port)) {
    console.log(`♻️  ${label} already listening on ${port}; reusing it.`);
    return;
  }
  console.log(`▶️  Starting ${label} on port ${port}...`);
  launch(label, 'npm', ['run', 'dev'], cwd);
}

async function start() {
  await startService('BACKEND', 5000, path.join(__dirname, 'backend'));
  await startService('AVATAR-VIEWER', 5174, path.join(__dirname, 'avatar-web-viewer'));
  await new Promise(resolve => setTimeout(resolve, 1200));

  let port = 8081;
  while (port <= 8090 && await isPortInUse(port)) port += 1;
  if (port > 8090) {
    console.error('No free Expo port found between 8081 and 8090. Close an unused Expo/Metro process and retry.');
    shutdown();
    process.exitCode = 1;
    return;
  }
  if (port !== 8081) console.log(`📱 Expo port 8081 is occupied; starting on ${port}.`);
  else console.log('📱 Starting React Native app on port 8081...');
  launch('EXPO', 'npx', ['expo', 'start', '--port', String(port)], __dirname, 'inherit');
}

function shutdown() {
  console.log('\n🛑 Shutting down app processes...');
  for (const child of children) if (!child.killed) child.kill('SIGTERM');
}

process.on('SIGINT', () => { shutdown(); process.exit(); });
process.on('SIGTERM', () => { shutdown(); process.exit(); });
start().catch(error => { console.error('Could not start app:', error); shutdown(); process.exitCode = 1; });
