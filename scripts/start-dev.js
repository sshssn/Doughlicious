import { exec } from 'child_process';
import concurrently from 'concurrently';

// Run backend and frontend concurrently
concurrently([
  {
    name: 'backend',
    command: 'pnpm --filter doughlicious-backend dev || npm run dev --prefix backend',
    prefixColor: 'blue',
  },
  {
    name: 'frontend',
    command: 'pnpm run sync-env && (pnpm --filter doughlicious-frontend dev || npm run dev --prefix frontend)',
    prefixColor: 'green',
  },
], {
  prefix: 'name',
  killOthersOn: ['failure', 'success'],
  restartTries: 0,
}).result.catch((error) => {
  console.error('Error starting dev servers:', error);
  process.exit(1);
});




