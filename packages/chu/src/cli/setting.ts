import { chalk, execa, exit, hasPnpm, hasYarn, logger } from '@anmeng/utils';
import { execSync } from 'child_process';
// @ts-ignore
import inquirer from 'inquirer'; // TODO 此处使用的是7.x.x 版本 最新的9.x.x 版本会被解析成cj类型模块引入
import npmRegistries from '../promptModules/npmRegistries';

const { clearConsole } = logger;

interface IOptions {
  Choose: string;
  [k: string]: any;
}
export async function settingNpmRegistry(options: IOptions) {
  const chooseRegistryName = options['Choose'] || '';

  // 展示当前npm
  const npmRegistryUrl = execSync('npm config get registry');
  const npmInfoStr = npmRegistryUrl
    .toString()
    .substring(0, npmRegistryUrl.lastIndexOf('/'));

  let npmUrl;
  if (chooseRegistryName) {
    try {
      // @ts-ignore
      npmUrl = npmRegistries.choices.find(
        (i) =>
          (i.name || '').toLocaleLowerCase() ===
          chooseRegistryName.toLocaleLowerCase(),
      ).value;
    } catch (e) {
      npmUrl = -1;
      return Promise.reject(
        `${chalk.redBright(
          'The registration environment you have selected does not exist !',
        )}`,
      );
    }
  } else {
    //先展示当前npm环境
    const isHasPnpm = hasPnpm();
    const isHasYarn = hasYarn();
    //
    clearConsole();

    logger.info(`                     `);
    logger.info(`----------The current environment-----------`);
    logger.info(`          pnpm : ${isHasPnpm}`);
    logger.info(`          yarn : ${isHasYarn}`);
    logger.info(`--------------------------------------------`);
    logger.info(`Current npm registry url  ${chalk.greenBright(npmInfoStr)}`);

    const npmRegistriesData = {
      ...npmRegistries,
      choices: npmRegistries.choices.map(({ name, value }) => {
        return {
          name: `${name} Source`,
          value,
        };
      }),
    };
    const { ...rest } = await inquirer.prompt([npmRegistriesData]);
    npmUrl = rest.npmRegistries;
    clearConsole();
  }

  if (npmUrl === -1) {
    return Promise.reject('url is not has');
  }

  if (npmUrl) {
    execa.execaSync('npm', ['config', 'set', 'registry', npmUrl]);
    logger.info(`Current npm registry url Switched:`);
    logger.event(
      `${chalk.greenBright(npmInfoStr)} -> ${chalk.greenBright(npmUrl)}`,
    );
  } else {
    logger.warn(`Not much has changed`);
  }
  exit();
}
