#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Temporal Workflow Agent Development Environment\n');

// Start the worker
console.log('Starting Temporal Worker...');
const worker = spawn('npm', ['run', 'dev:worker'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

// Start Next.js dev server
console.log('Starting Next.js Development Server...');
const nextjs = spawn('npm', ['run', 'dev'], {
  stdio: 'inherit', 
  shell: true,
  cwd: process.cwd()
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n Shutting down development environment...');
  worker.kill();
  nextjs.kill();
  process.exit(0);
});

worker.on('error', (err) => {
  console.error('Worker error:', err);
});

nextjs.on('error', (err) => {
  console.error('Next.js error:', err);
});