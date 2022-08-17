import { fsExtra, hasPnpm, hasYarn } from '@anmengweilai/utils';
import { join } from 'path';

export function checkNodeEnv(cwd = '') {
  const isPnpm = hasPnpm();
  const isYarn = hasYarn();

  let basePath = process.cwd();

  if (cwd) {
    basePath = cwd;
  }

  const basePnpmClockPath = join(basePath, 'pnpm-lock.yaml');
  const baseYarnClockPath = join(basePath, 'yarn-lock.yaml');

  if (isPnpm && fsExtra.existsSync(basePnpmClockPath)) {
    return 'pnpm';
  }

  if (isYarn && fsExtra.existsSync(baseYarnClockPath)) {
    return 'yarn';
  }

  return 'npm';
}
