import {
  execa,
  exit,
  fastGlob,
  fsExtra,
  isLinux,
  isMacintosh,
  isWindows,
  logger,
} from '@anmeng/utils';
import inquirer, { ChoiceOptions } from 'inquirer';
// import os from 'os';
import { join, sep } from 'path';
import { EDITORS_TYPE } from '../constants';
import createProjectPathsPrompt from '../promptModules/projectPaths';
import { dataFilter } from '../utils/dataFilter';
import { loadOptions } from '../utils/options';

interface ValueParams {
  filter?: string;
  choose?: string;
  open?: string;
}

export default async function (value: ValueParams, _options?: any) {
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
    if (item[0] !== sep) {
      item = `${sep}${item}`;
    }
    return item;
  });

  let allBaseProjectDirPaths: string[] = [];
  for (let basePath of baseProjectsDirPaths) {
    const projectDirPaths = await fastGlob(['**/.git/config'], {
      cwd: basePath,
      dot: true,
      ignore: ['**/node_modules/**', '**/packages/**', '**/compiled/**'],
    });

    allBaseProjectDirPaths = allBaseProjectDirPaths.concat(
      projectDirPaths.map((path: string) => {
        return join(basePath, path.split('.git/config')[0]);
      }),
    );
  }

  if (value.choose) {
    await chooseProjectOnThree(
      allBaseProjectDirPaths,
      baseProjectsDirPaths,
      value,
    );
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
  value: ValueParams,
) {
  let choices: ChoiceOptions[] = [];
  for (let basePath of baseProjectsDirPaths) {
    if (basePath[basePath.length - 1] !== sep) {
      basePath = `${basePath}${sep}`;
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
          .split(sep)
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
  await openProjectInEditor(value.open, chooseProject);
  logger.event(`cd ${chooseProject}`);
}

async function chooseProjectOnThree(
  allBaseProjectDirPaths: string[],
  baseProjectsDirPaths: string[],
  value: ValueParams,
) {
  const choices: ChoiceOptions[] = baseProjectsDirPaths.map((item) => {
    return {
      name: item.split(sep).pop(),
      value: item,
    };
  });

  let { chooseProject: baseProjectsDirPath } = (await inquirer.prompt([
    createProjectPathsPrompt(choices),
  ])) as {
    chooseProject: string;
  };
  if (baseProjectsDirPath.charAt(0) !== sep) {
    baseProjectsDirPath = `${sep}${baseProjectsDirPath}`;
  }
  let paths = allBaseProjectDirPaths.filter((item) =>
    item.includes(baseProjectsDirPath),
  );

  await generatePrompt(paths, baseProjectsDirPath, value);
}

async function generatePrompt(
  allBaseProjectDirPaths: string[],
  baseProjectsDirPath: string,
  value: ValueParams,
) {
  const hasPath: string[] = [];
  const choices: ChoiceOptions[] = [];
  const baseDirPath = baseProjectsDirPath.endsWith(sep)
    ? baseProjectsDirPath.substring(0, baseProjectsDirPath.length - 1)
    : baseProjectsDirPath;
  allBaseProjectDirPaths.forEach((item) => {
    const name = item.replace(baseDirPath, '').split(sep)[1];
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
  const pathStr = baseProjectsDirPathStr.endsWith(sep)
    ? baseProjectsDirPathStr
    : baseProjectsDirPathStr + sep;
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
    await generatePrompt(paths, baseProjectsDirPathStr, value);
  } else {
    const [pathStr] = paths;
    await openProjectInEditor(value.open, pathStr);
    logger.event(`cd ${pathStr}`);
    return exit();
  }
}

type EditorNames = keyof typeof EDITORS_TYPE;

const openProjectInEditor = async (open?: string, pathStr?: string) => {
  if (!open) return false;
  const openStr =
    EDITORS_TYPE[open.toString().toLocaleLowerCase() as EditorNames] ||
    EDITORS_TYPE.vs;
  if (isWindows) {
    logger.error('Not supported windows！');
    return false;
  }
  if (isLinux || isMacintosh) {
    execa.execaSync('open', ['-a', openStr, pathStr]);
  }
};
