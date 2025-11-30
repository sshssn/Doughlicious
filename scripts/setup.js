#!/usr/bin/env node

import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function runCommand(command, args, cwd = rootDir) {
  return new Promise((resolve, reject) => {
    log(`\n${colors.blue}▶ Running: ${command} ${args.join(' ')}${colors.reset}`, colors.bright);
    
    const proc = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    proc.on('error', (err) => {
      reject(err);
    });
  });
}

async function setup() {
  try {
    log('\n🍩 Welcome to Doughlicious Setup!\n', colors.bright + colors.green);

    // Check for .env.local
    const envPath = join(rootDir, '.env.local');
    if (!existsSync(envPath)) {
      log('⚠️  Warning: .env.local file not found!', colors.yellow);
      log('Please create a .env.local file with your environment variables.', colors.yellow);
      log('See .env.example or README.md for required variables.\n', colors.yellow);
    } else {
      log('✓ Found .env.local file', colors.green);
    }

    // Install root dependencies
    log('\n📦 Installing root dependencies...', colors.bright);
    await runCommand('pnpm', ['install']);

    // Install backend dependencies
    log('\n📦 Installing backend dependencies...', colors.bright);
    await runCommand('pnpm', ['install'], join(rootDir, 'backend'));

    // Install frontend dependencies
    log('\n📦 Installing frontend dependencies...', colors.bright);
    await runCommand('pnpm', ['install'], join(rootDir, 'frontend'));

    // Generate Prisma client
    log('\n🔧 Generating Prisma client...', colors.bright);
    await runCommand('pnpm', ['run', 'prisma:generate'], join(rootDir, 'backend'));

    // Run Prisma migrations
    log('\n🗄️  Running database migrations...', colors.bright);
    try {
      await runCommand('pnpm', ['run', 'prisma:migrate'], join(rootDir, 'backend'));
    } catch (error) {
      log('⚠️  Migration failed. You may need to run migrations manually.', colors.yellow);
      log('Run: cd backend && pnpm run prisma:migrate', colors.yellow);
    }

    log('\n✨ Setup complete!', colors.bright + colors.green);
    log('\n🚀 To start the development server, run:', colors.bright);
    log('   pnpm dev\n', colors.blue);

  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

setup();
