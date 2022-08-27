export default () => {
  return '@anmeng/utils';
};

import axios from '../compiled/axios';
import chalk from '../compiled/chalk';
import commander from '../compiled/commander';
import crossSpawn from '../compiled/cross-spawn';
import debug from '../compiled/debug';
import deepmerge from '../compiled/deepmerge';
import * as execa from '../compiled/execa';
import fastGlob from '../compiled/fast-glob';
import fsExtra from '../compiled/fs-extra';
import Fuse from '../compiled/fuse.js';
import { glob } from '../compiled/glob';
import leven from '../compiled/leven';
import lodash from '../compiled/lodash';
import mustache from '../compiled/mustache';
import prompts from '../compiled/prompts';
import rimraf from '../compiled/rimraf';
import semver from '../compiled/semver';
import stripAnsi from '../compiled/strip-ansi';
import yParser from '../compiled/yargs-parser';
import Generator from './Generator/Generator';
import { isLocalDev } from './methods/isLocalDev';
import * as logger from './methods/logger';

export {
  hasGit,
  hasPnpm,
  hasYarn,
  isLinux,
  isMacintosh,
  isWindows,
} from './methods/env';
export { exit, exitProcess } from './methods/exit';
export { getObjVal, setObjVal, unsetObjVal } from './methods/setObject';
export { createSchema, validate, validateSync } from './methods/validate';
export {
  axios,
  chalk,
  crossSpawn,
  debug,
  deepmerge,
  execa,
  fastGlob,
  Fuse,
  fsExtra,
  lodash,
  mustache,
  prompts,
  rimraf,
  semver,
  stripAnsi,
  glob,
  yParser,
  commander,
  logger,
  leven,
  isLocalDev,
  Generator,
};
