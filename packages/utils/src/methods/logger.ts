import { join } from 'path';
import readline from 'readline';
import chalk from '../../compiled/chalk';
import fsExtra from '../../compiled/fs-extra';
import { importLazy } from './importLazy';

export const prefixes = {
  wait: chalk.cyan('wait') + '   -',
  error: chalk.red('error') + '  -',
  fatal: chalk.red('fatal') + '  -',
  warn: chalk.yellow('warn') + '   -',
  ready: chalk.green('ready') + '  -',
  info: chalk.cyan('info') + '   -',
  event: chalk.magenta('event') + '  -',
  debug: chalk.gray('debug') + '  -',
};

const enableFSLogger =
  process.env.FS_LOGGER !== 'none' && !process.versions.webcontainer;

const loggerDir = join(process.cwd(), 'node_modules/.cache/logger');
const loggerPath = join(loggerDir, 'chu.log');

let logger: any;
if (enableFSLogger) {
  const { default: pino }: typeof import('pino') = importLazy(
    require.resolve('pino'),
  );
  fsExtra.mkdirpSync(loggerDir);
  const customLevels = {
    ready: 31,
    event: 32,
    wait: 55,
    debug: 30,
  };
  logger = pino(
    {
      customLevels,
    },
    pino.transport({
      targets: [
        {
          target: require.resolve('pino/file'),
          options: {
            destination: loggerPath,
          },
          level: 'trace',
        },
      ],
    }),
  );
} else {
  logger = {};
  Object.keys(prefixes).forEach((key) => {
    logger[key] = () => {};
  });
}

export function wait(...message: any[]) {
  console.log(prefixes.wait, ...message);
  logger.wait(message[0]);
}

export function error(...message: any[]) {
  console.error(prefixes.error, ...message);
  logger.error(message[0]);
}

export function fatal(...message: any[]) {
  console.error(prefixes.error, ...message);
  logger.fatal(message[0]);
}

export function warn(...message: any[]) {
  console.warn(prefixes.warn, ...message);
  logger.warn(message[0]);
}

export function ready(...message: any[]) {
  console.log(prefixes.ready, ...message);
  logger.ready(message[0]);
}

export function info(...message: any[]) {
  console.log(prefixes.info, ...message);
  logger.info(message[0]);
}

export function event(...message: any[]) {
  console.log(prefixes.event, ...message);
  logger.event(message[0]);
}

export function debug(...message: any[]) {
  if (process.env.DEBUG) {
    console.log(prefixes.debug, ...message);
  }
  logger.debug(message[0]);
}

export function clearConsole(title: string = '') {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    if (title) {
      console.log(title);
    }
  }
}
export function getLatestLogFilePath() {
  return enableFSLogger ? loggerPath : null;
}
