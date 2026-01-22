#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

async function checkTemporalCLI() {
  try {
    await execAsync('temporal --version');
    console.log('Temporal CLI is installed');
    return true;
  } catch (error) {
    console.log('Temporal CLI not found');
    return false;
  }
}

async function checkDockerCompose() {
  try {
    await execAsync('docker-compose --version');
    console.log('Docker Compose is available');
    return true;
  } catch (error) {
    try {
      await execAsync('docker compose version');
      console.log('Docker Compose is available');
      return true;
    } catch (error2) {
      console.log('Docker Compose not found');
      return false;
    }
  }
}

async function startTemporalDev() {
  console.log('Starting Temporal development server...');
  
  const temporal = spawn('temporal', ['server', 'start-dev'], {
    stdio: 'inherit',
    shell: true
  });

  temporal.on('error', (err) => {
    console.error('Failed to start Temporal server:', err.message);
    console.log('\n Installation options:');
    console.log('1. Install Temporal CLI: https://docs.temporal.io/cli#install');
    console.log('2. Use Docker: docker run --rm -p 7233:7233 -p 8233:8233 temporalio/auto-setup:latest');
  });

  // Handle cleanup
  process.on('SIGINT', () => {
    console.log('\n Shutting down Temporal server...');
    temporal.kill();
    process.exit(0);
  });
}

async function main() {
  console.log(' Checking Temporal setup...\n');

  const hasTemporalCLI = await checkTemporalCLI();
  const hasDockerCompose = await checkDockerCompose();

  if (hasTemporalCLI) {
    await startTemporalDev();
  } else if (hasDockerCompose) {
    console.log(' Starting Temporal with Docker...');
    const docker = spawn('docker', [
      'run', '--rm', 
      '-p', '7233:7233', 
      '-p', '8233:8233', 
      'temporalio/temporal',
      'server', 'start-dev',
      '--ip', '0.0.0.0'
    ], {
      stdio: 'inherit',
      shell: true
    });

    docker.on('error', (err) => {
      console.error(' Failed to start Temporal with Docker:', err.message);
    });

    // Handle cleanup
    process.on('SIGINT', () => {
      console.log('\n Shutting down Temporal server...');
      docker.kill();
      process.exit(0);
    });
  } else {
    console.log('\n Neither Temporal CLI nor Docker found.');
    console.log('\n Please install one of the following:');
    console.log('1. Temporal CLI: https://docs.temporal.io/cli#install');
    console.log('2. Docker: https://docs.docker.com/get-docker/');
    console.log('\nThen run this script again.');
    process.exit(1);
  }
}

main().catch(console.error);