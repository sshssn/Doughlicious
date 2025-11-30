import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read root .env file if it exists
const rootEnvPath = join(rootDir, '.env');
const frontendEnvPath = join(rootDir, 'frontend', '.env.local');
const backendEnvPath = join(rootDir, 'backend', '.env');

if (existsSync(rootEnvPath)) {
  const rootEnv = readFileSync(rootEnvPath, 'utf-8');
  
  // Sync to frontend .env.local
  if (!existsSync(join(rootDir, 'frontend', '.env.local'))) {
    writeFileSync(frontendEnvPath, rootEnv, 'utf-8');
    console.log('✓ Synced .env to frontend/.env.local');
  }
  
  // Sync to backend .env
  if (!existsSync(backendEnvPath)) {
    writeFileSync(backendEnvPath, rootEnv, 'utf-8');
    console.log('✓ Synced .env to backend/.env');
  }
} else {
  console.log('⚠ No root .env file found');
}





