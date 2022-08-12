import { exit, fsExtra, isLocalDev } from '@chu/utils';
import os from 'os';
import path, { join } from 'path';
import { platform } from 'process';
import { DEFAULT_CHU_RC_JSON, DEFAULT_CONFIG_FILE } from '../constants';

const xdgConfigPath = (file: string) => {
  const xdgConfigHome = process.env.XDG_CONFIG_HOME;
  if (xdgConfigHome) {
    const rcDir = path.join(xdgConfigHome, 'chu');
    if (!fsExtra.existsSync(rcDir)) {
      fsExtra.ensureDirSync(rcDir, 0o700);
    }
    return path.join(rcDir, file);
  }
};

const migrateWindowsConfigPath = (file: string) => {
  if (platform !== 'win32') {
    return;
  }
  const appData = process.env.APPDATA;
  if (appData) {
    const rcDir = path.join(appData, 'vue');
    const rcFile = path.join(rcDir, file);
    const properRcFile = path.join(os.homedir(), file);
    if (fsExtra.existsSync(rcFile)) {
      try {
        if (fsExtra.existsSync(properRcFile)) {
          fsExtra.removeSync(rcFile);
        } else {
          fsExtra.moveSync(rcFile, properRcFile);
        }
      } catch (e) {
        exit(1);
      }
    }
  }
};

export const getRcPath = (file: string = DEFAULT_CONFIG_FILE) => {
  migrateWindowsConfigPath(file);
  return isLocalDev()
    ? join(isLocalDev() as string, file)
    : xdgConfigPath(file) || path.join(os.homedir(), file);
};

export const checkDefConfigRcFile = (reset = false) => {
  const rcPath = getRcPath();
  if (fsExtra.existsSync(rcPath) && !reset) {
    return;
  }
  fsExtra.writeFile(rcPath, JSON.stringify(DEFAULT_CHU_RC_JSON), 'utf-8');
};
