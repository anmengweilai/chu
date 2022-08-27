import { execSync } from 'child_process';
import { isLocalDev } from './isLocalDev';

let _hasGit: any;

export function hasGit() {
  if (isLocalDev()) {
    return true;
  }
  if (!!_hasGit) {
    return _hasGit;
  }
  try {
    execSync('git --version', { stdio: 'ignore' });
    _hasGit = true;
  } catch (e) {
    _hasGit = false;
  }
  return _hasGit;
}

let _hasYarn: any;

export function hasYarn() {
  if (isLocalDev()) {
    return true;
  }
  if (_hasYarn != null) {
    return _hasYarn;
  }
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return (_hasYarn = true);
  } catch (e) {
    return (_hasYarn = false);
  }
}

let _hasPnpm: any;

export function hasPnpm() {
  if (isLocalDev()) {
    return true;
  }
  if (!!_hasPnpm) {
    return _hasPnpm;
  }
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    _hasYarn = true;
  } catch (e) {
    _hasYarn = false;
  }
  return _hasYarn;
}

export const isWindows = process.platform === 'win32';
export const isMacintosh = process.platform === 'darwin';
export const isLinux = process.platform === 'linux';
