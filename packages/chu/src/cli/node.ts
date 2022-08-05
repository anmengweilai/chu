import { exit, isLocalDev, logger } from '@chu/utils';
import { FRAMEWORK_NAME, MIN_NODE_VERSION } from '../constants';

export function checkVersion() {
  const version = parseInt(process.version.slice(1));
  if (version < MIN_NODE_VERSION || version === 15 || version === 17) {
    logger.error(
      `Your node version ${version} is not supported, please upgrade to ${MIN_NODE_VERSION} or above except 15 or 17.`,
    );
    exit(1);
  }
}

export function checkLocal() {
  if (isLocalDev()) {
    logger.info('@local');
  }
}

export function setNodeTitle(name?: string) {
  if (process.title === 'node') {
    process.title = name || FRAMEWORK_NAME;
  }
}

export function setNoDeprecation() {
  // Use magic to suppress node deprecation warnings
  // See: https://github.com/nodejs/node/blob/master/lib/internal/process/warning.js#L77
  // @ts-ignore
  process.noDeprecation = '1';
}
