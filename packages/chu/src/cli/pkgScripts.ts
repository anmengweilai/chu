import { chalk, execa, exit, fsExtra, logger } from '@chu/utils';
import inquirer, { ChoiceOptions } from 'inquirer';
import { join } from 'path';
import createScriptsPrompt from '../promptModules/npmScripts';
import { checkNodeEnv } from '../utils/checkEnv';

export async function pkgScripts(value: { show?: boolean }, _options: any) {
  const showScripts = value?.show || false;

  const basePath = process.cwd();
  const packageJSONPath = join(basePath, 'package.json');

  if (!fsExtra.existsSync(packageJSONPath)) {
    logger.error(
      chalk.red('Please check if you are currently in the correct project ！ '),
    );
    return exit(0);
  }

  const packageJSONData = fsExtra.readJsonSync(packageJSONPath, {
    encoding: 'utf-8',
  });

  if (!packageJSONData.scripts) {
    logger.error(
      chalk.red(
        'No scripts exist in the current projects package.json  ！！！！',
      ),
    );
    return exit(0);
  }

  if (showScripts) {
    Object.entries(packageJSONData.scripts).forEach(([key, value]) => {
      logger.info(`${key} : ${value}`);
    });
    return exit();
  }

  const scriptChoices: ChoiceOptions[] = Object.entries(
    packageJSONData.scripts,
  ).map(([key, value]) => {
    return {
      name: `${key} : ${value}`,
      value: key,
    };
  });

  let { npmRunScript } = (await inquirer.prompt([
    createScriptsPrompt(scriptChoices),
  ])) as {
    npmRunScript: string;
  };

  const nodeEnv = checkNodeEnv(basePath);

  try {
    logger.event(chalk.bgBlue(`${nodeEnv} run ${npmRunScript}`));
    const subprocess = execa.execa(nodeEnv, ['run', npmRunScript], {
      cwd: basePath,
      stdout: 'pipe',
    });
    subprocess.stdout.pipe(process.stdout);
    const { stdout } = await subprocess;
    logger.info(stdout);
  } catch (e: any) {
    console.error(`${chalk.red(e.toString())}`);
    exit(1);
  }

  logger.info(
    chalk.greenBright(`${nodeEnv} run ${npmRunScript} status: Success`),
  );
}
