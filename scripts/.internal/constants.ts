import { join } from 'path';

const ROOT = join(__dirname, '../../');
export const PATHS = {
  ROOT,
  PACKAGES: join(ROOT, './packages'),
  EXAMPLES: join(ROOT, './examples'),
  LERNA_CONFIG: join(ROOT, './lerna.json'),
  JEST_TURBO_CONFIG: join(ROOT, './jest.turbo.config.ts'),
} as const;

export const SCRIPTS = {
  BUNDLE_DEPS: 'chu-scripts bundleDeps',
  DEV: 'chu-scripts father dev',
  'DEV:TSC': 'pnpm tsc --watch',
  BUILD: 'chu-scripts father build',
  'BUILD:TSC': 'pnpm tsc',
  TEST_TURBO: 'chu-scripts jest-turbo',
} as const;
