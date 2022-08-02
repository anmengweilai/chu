export default () => {
  return '@chu/utils';
};

import chalk from '../compiled/chalk';
import commander from '../compiled/commander';
import crossSpawn from '../compiled/cross-spawn';
import debug from '../compiled/debug';
import deepmerge from '../compiled/deepmerge';
import fsExtra from '../compiled/fs-extra';
import { glob } from '../compiled/glob';
import lodash from '../compiled/lodash';
import prompts from '../compiled/prompts';
import rimraf from '../compiled/rimraf';
import semver from '../compiled/semver';
import stripAnsi from '../compiled/strip-ansi';
import yParser from '../compiled/yargs-parser';
import { isLocalDev } from './methods/isLocalDev';
import * as logger from './methods/logger';

export {
  chalk,
  crossSpawn,
  debug,
  deepmerge,
  fsExtra,
  lodash,
  prompts,
  rimraf,
  semver,
  stripAnsi,
  glob,
  yParser,
  commander,
  logger,
  isLocalDev,
};
