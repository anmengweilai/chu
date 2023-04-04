import {
  execa,
  exit,
  fastGlob,
  fsExtra,
  isLinux,
  isMacintosh,
  isWindows,
  lodash,
  logger,
} from '@anmeng/utils';
import inquirer, { ChoiceOptions } from 'inquirer';
import { join, sep } from 'path';
import { EDITORS_TYPE } from '../constants';
import createProjectPathsPrompt from '../promptModules/projectPaths';
import { dataFilter } from '../utils/dataFilter';
import { loadOptions } from '../utils/options';

export interface ValueParams {
  filter?: string;
  choose?: string;
  open?: string;
}

export interface TreeMapItem {
  [key: string]: TreeMapItem;
}

const currentPaths: string[] = [];

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

  let { chooseProject: baseProjectsDirPath } = await inquirer.prompt(
    [createProjectPathsPrompt(choices)],
    {},
  );
  if (baseProjectsDirPath.charAt(0) !== sep) {
    baseProjectsDirPath = `${sep}${baseProjectsDirPath}`;
  }

  const choicesTree = await generatePrompt(
    allBaseProjectDirPaths,
    baseProjectsDirPath,
  );
  let isEnd = false;
  let pathStr = changeSep(
    changeSep(baseProjectsDirPath) + currentPaths.join(sep),
  );
  while (!isEnd) {
    const lastPath = currentPaths[currentPaths.length - 1];
    let keyValues = [];
    if (lastPath) {
      keyValues = ['...', ...Object.keys(choicesTree[lastPath] || {})];
    } else {
      keyValues = Object.keys(choicesTree || {});
    }
    const defChoices = keyValues.map((item) => {
      return {
        name: item,
        value: item,
      };
    });
    pathStr = changeSep(
      changeSep(baseProjectsDirPath) + currentPaths.join(sep),
    );
    const { chooseProject } = await inquirer.prompt([
      createProjectPathsPrompt(defChoices, pathStr),
    ]);
    if (chooseProject === '...') {
      currentPaths.pop();
      continue;
    }
    if (typeof chooseProject === 'string') {
      currentPaths.push(chooseProject);
      lodash.isEmpty(lodash.get(choicesTree, currentPaths)) && (isEnd = true);
    }
  }

  pathStr && (await openProjectInEditor(value.open, pathStr));
  pathStr && logger.event(`cd ${pathStr}`);
  return exit();
}

async function generatePrompt(
  allBaseProjectDirPaths: string[],
  baseProjectsDirPath: string,
) {
  const treeMap: TreeMapItem = {};
  const includePaths: string[] = allBaseProjectDirPaths.filter((p) =>
    p.includes(baseProjectsDirPath),
  );
  for (const baseProPath of includePaths) {
    const needPath = baseProPath.replace(baseProjectsDirPath, '');
    const needPathArr = needPath.split(sep).filter(Boolean);
    needPathArr.reduce((pre, cur) => {
      if (!pre[cur]) {
        pre[cur] = {};
      }
      return pre[cur];
    }, treeMap);
  }

  return treeMap;
}

type EditorNames = keyof typeof EDITORS_TYPE;

const openProjectInEditor = async (open?: string, pathStr: string = '') => {
  if (!open) return false;
  const openStr: string =
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

const changeSep = (str: string) => {
  return str.endsWith(sep) ? str : `${str}${sep}`;
};
