import { spawnSync } from 'node:child_process';

const env = {
  ...process.env,
  NEXT_PUBLIC_TRUE_AUDIT_AUTH_MODE: process.env.PLAYWRIGHT_AUTH_MODE ?? 'demo',
  NEXT_PUBLIC_TRUE_AUDIT_STORAGE_MODE: process.env.PLAYWRIGHT_STORAGE_MODE ?? 'local',
};

function run(command) {
  const result = spawnSync(command, {
    env,
    stdio: 'inherit',
    shell: true,
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('npm run build');
run('npx playwright test');
