import { logger } from '@chu/utils';
import { checkDefConfigRcFile } from '../utils/rcFile';
import { settingCommandsOptions } from './commander';
import {
  checkLocal,
  checkVersion as checkNodeVersion,
  setNoDeprecation,
  setNodeTitle,
} from './node';

interface IOpts {
  presets?: string[];
}

export async function run(_opts?: IOpts) {
  checkNodeVersion();
  checkLocal();
  setNodeTitle();
  checkDefConfigRcFile();
  setNoDeprecation();
  try {
    settingCommandsOptions();
  } catch (e) {
    logger.fatal(e);
    process.exit(1);
  }
}
