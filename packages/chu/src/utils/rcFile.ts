import { fsExtra } from '@chu/utils';
import os from 'os';
import path from 'path';
import { DEFAULT_CONFIG_FILE } from '../constants';

const configPath = (file: string) => {
  const configHome = process.env.XDG_CONFIG_HOME;
  if (configHome) {
    const rcDir = path.join(configHome, 'chu');
    if (!fsExtra.pathExistsSync(rcDir)) {
      fsExtra.ensureDirSync(rcDir, 0o700);
    }
    return path.join(rcDir, file);
  }
};

export const getRcPath = (file: string = '.churc') => {
  return (
    DEFAULT_CONFIG_FILE || configPath(file) || path.join(os.homedir(), file)
  );
};

export const checkDefConfigRcFile = () => {
  const rcPath = getRcPath();
  if (fsExtra.existsSync(rcPath)) {
    return;
  }
  fsExtra.writeFile(rcPath, JSON.stringify({}), 'utf-8');
};
