import { exit, fastGlob, fsExtra, isWindows, logger } from '@anmeng/utils';
import inquirer, { ChoiceOptions } from 'inquirer';
// import os from 'os';
import { join } from 'path';
import createProjectPathsPrompt from '../promptModules/projectPaths';
import { dataFilter } from '../utils/dataFilter';
import { loadOptions } from '../utils/options';

const sysSeparator = isWindows ? '\\' : '/';

export default async function (
  value: { filter?: string; choose?: string },
  _options?: any,
) {
  // const homeDir = os.homedir();

  let { baseProjectsDirPaths } = (await loadOptions()) as {
    baseProjectsDirPaths: string[];
  };

  if (baseProjectsDirPaths.length === 0) {
    logger.error('You should setting baseProjectsDirPaths');
    return exit(0);
  }

  baseProjectsDirPaths = baseProjectsDirPaths.map((item) => {
    if (isWindows) return item;
    if (item[0] !== sysSeparator) {
      item = `${sysSeparator}${item}`;
    }
    return item;
  });

  console.log({ baseProjectsDirPaths });

  let allBaseProjectDirPaths: string[] = [];
  for (let basePath of baseProjectsDirPaths) {
    const projectDirPaths = await fastGlob(['**/.git/config'], {
      cwd: basePath,
      dot: true,
      ignore: ['**/node_modules/**', '**/packages/**', '**/compiled/**'],
    });

    console.log({ projectDirPaths });

    allBaseProjectDirPaths = allBaseProjectDirPaths.concat(
      projectDirPaths.map((path) => {
        return join(basePath, path.split('.git/config')[0]);
      }),
    );
  }

  if (value.choose) {
    await chooseProjectOnThree(allBaseProjectDirPaths, baseProjectsDirPaths);
  } else {
    await chooseProjectOnList(
      allBaseProjectDirPaths,
      baseProjectsDirPaths,
      value,
    );
  }
  exit(0);
}

async function chooseProjectOnList(
  allBaseProjectDirPaths: string[],
  baseProjectsDirPaths: string[],
  value: { filter?: string; choose?: string },
) {
  let choices: ChoiceOptions[] = [];
  for (let basePath of baseProjectsDirPaths) {
    if (basePath[basePath.length - 1] !== sysSeparator) {
      basePath = `${basePath}${sysSeparator}`;
    }
    for (const baseProPath of allBaseProjectDirPaths) {
      const jsonPath = join(baseProPath, 'package.json');
      if (!fsExtra.existsSync(jsonPath)) continue;
      if (!baseProPath.includes(basePath)) continue;
      const json = fsExtra.readJSONSync(jsonPath);
      let name = '';
      if (json.name) {
        name = json.name;
      } else {
        name = baseProPath
          .slice(0, baseProPath.length - 1)
          .split(sysSeparator)
          .pop() as string;
      }

      choices.push({
        name: `${name}:(${baseProPath.replace(basePath, '')})`,
        value: baseProPath,
      });
    }
  }

  if (value?.filter) {
    const { filter: filterValue } = value;
    choices = dataFilter(filterValue, choices, ['name'], {});
  }

  if (choices.length === 0) {
    logger.error('No corresponding item found');
    return exit(0);
  }

  const { chooseProject } = (await inquirer.prompt([
    createProjectPathsPrompt(choices),
  ])) as {
    chooseProject: string;
  };
  // TODO: linux等系统无法通过node的子进程操作父进程目录 可考虑 ~/.bash_profile 内相关函数操作但是未能成功
  logger.event(`cd ${chooseProject}`);
}

async function chooseProjectOnThree(
  allBaseProjectDirPaths: string[],
  baseProjectsDirPaths: string[],
) {
  const choices: ChoiceOptions[] = baseProjectsDirPaths.map((item) => {
    return {
      name: item.split(sysSeparator).pop(),
      value: item,
    };
  });

  let { chooseProject: baseProjectsDirPath } = (await inquirer.prompt([
    createProjectPathsPrompt(choices),
  ])) as {
    chooseProject: string;
  };
  if (baseProjectsDirPath.charAt(0) !== sysSeparator) {
    baseProjectsDirPath = `${sysSeparator}${baseProjectsDirPath}`;
  }
  let paths = allBaseProjectDirPaths.filter((item) =>
    item.includes(baseProjectsDirPath),
  );

  await generatePrompt(paths, baseProjectsDirPath);
}

async function generatePrompt(
  allBaseProjectDirPaths: string[],
  baseProjectsDirPath: string,
) {
  const hasPath: string[] = [];
  const choices: ChoiceOptions[] = [];
  const baseDirPath = baseProjectsDirPath.endsWith(sysSeparator)
    ? baseProjectsDirPath.substring(0, baseProjectsDirPath.length - 1)
    : baseProjectsDirPath;
  allBaseProjectDirPaths.forEach((item) => {
    const name = item.replace(baseDirPath, '').split(sysSeparator)[1];
    if (!hasPath.includes(name) && item.includes(baseDirPath)) {
      hasPath.push(name);
      choices.push({
        name,
        value: join(baseDirPath, name),
      });
    }
  });

  const { chooseProject: baseProjectsDirPathStr } = (await inquirer.prompt([
    createProjectPathsPrompt(choices),
  ])) as {
    chooseProject: string;
  };

  let paths = [];
  const pathStr = baseProjectsDirPathStr.endsWith(sysSeparator)
    ? baseProjectsDirPathStr
    : baseProjectsDirPathStr + sysSeparator;
  for (const itemPath of allBaseProjectDirPaths) {
    if (itemPath === pathStr) {
      paths = [itemPath];
      break;
    }
    if (itemPath.includes(pathStr)) {
      paths.push(itemPath);
    }
  }

  if (paths.length > 1) {
    await generatePrompt(paths, baseProjectsDirPathStr);
  } else {
    logger.event(`cd ${paths[0]}`);
    return exit();
  }
}
