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
    exit(1);
  }
}
