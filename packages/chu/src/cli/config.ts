import {
  chalk,
  fsExtra,
  getObjVal,
  setObjVal,
  unsetObjVal,
} from '@anmengweilai/utils';
import { getRcPath } from '../utils/rcFile';

interface IOptions {
  delete?: string;
  set?: string;
  get?: string;
  json?: string;
}

export const configure = async (value: string, options: IOptions) => {
  const file = getRcPath();
  const config = await fsExtra.readJson(file);
  if (!options?.get && !options.delete && !options.set) {
    if (options.json) {
      console.log(
        JSON.stringify({
          resolvedPath: file,
          content: config,
        }),
      );
    } else {
      console.log(
        'Resolved path: ' + file + '\n',
        JSON.stringify(config, null, 2),
      );
    }
    return;
  }

  if (options.get) {
    const v = getObjVal(config, options.get);
    if (options.json) {
      console.log(`${chalk.green(options.get)}: ${JSON.stringify({ get: v })}`);
    } else {
      console.log(value);
    }
  }

  if (options.delete) {
    unsetObjVal(config, options.delete);
    await fsExtra.writeFile(file, JSON.stringify(config, null, 2), 'utf-8');
    if (options.json) {
      console.log(
        `${chalk.green(options.delete)}:${JSON.stringify({
          delete: options.delete,
        })}`,
      );
    } else {
      console.log(`You have removed the option: ${options.delete}`);
    }
  }

  if (options.set && !value) {
    throw new Error(
      `Make sure you define a value for the option ${options.set}`,
    );
  }

  if (options.set && value) {
    setObjVal(config, options.set, value.toString());

    if (!isNaN(Number(value))) {
      setObjVal(config, options.set, parseInt(value));
    }

    if (value === 'true') {
      setObjVal(config, options.set, true);
    }

    if (value === 'false') {
      setObjVal(config, options.set, false);
    }

    fsExtra.writeFile(file, JSON.stringify(config, null, 2), 'utf-8');
    if (options.json) {
      console.log(
        `${chalk.green(options.set)}:${JSON.stringify({
          updated: options.set,
        })}`,
      );
    } else {
      console.log(`You have updated the option: ${options.set} to ${value}`);
    }
  }
};
