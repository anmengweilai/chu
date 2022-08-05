import * as process from 'process';
import { isLocalDev } from './isLocalDev';

export const exitProcess = !process.env.CHU_CLI_API_MODE && !isLocalDev();

export const exit = (code: number = 0) => {
  if (exitProcess) {
    process.exit(code);
  } else if (code > 0) {
    throw new Error(`Process exited with code ${code}`);
  }
};
