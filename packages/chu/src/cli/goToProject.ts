import { fsExtra, logger } from '@chu/utils';
import fastGlob from 'fast-glob';
import inquirer, { ChoiceOptions } from 'inquirer';
// import os from 'os';
import { join } from 'path';
import projectPaths from '../promptModules/projectPaths';
import { dataFilter } from '../utils/dataFilter';
import { loadOptions } from '../utils/options';

export default async function (
  value: { filter?: string; choose?: string },
  _options?: any,
) {
  // const homeDir = os.homedir();
  // console.log({ value, options, homeDir });

  const { baseProjectsDirPaths } = await loadOptions();

  let choices: ChoiceOptions[] = [];

  for (let basePath of baseProjectsDirPaths) {
    if (basePath[0] !== '/') {
      basePath = `/${basePath}`;
    }

    let allBaseProjectDirPaths: string[] = [];
    const projectDirPaths = await fastGlob(['**/.git/config'], {
      cwd: basePath,
      dot: true,
      ignore: ['**/node_modules/**', '**/packages/**', '**/compiled/**'],
    });
    allBaseProjectDirPaths = allBaseProjectDirPaths.concat(
      projectDirPaths.map((path) => {
        return join(basePath, path.split('.git/config')[0]);
      }),
    );

    for (const baseProPath of allBaseProjectDirPaths) {
      const jsonPath = join(baseProPath, 'package.json');
      if (!fsExtra.existsSync(jsonPath)) continue;
      const json = fsExtra.readJSONSync(jsonPath);
      let name = '';
      if (json.name) {
        name = json.name;
      } else {
        name = baseProPath
          .slice(0, baseProPath.length - 1)
          .split('/')
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

  const { chooseProject } = (await inquirer.prompt([
    projectPaths(choices),
  ])) as {
    chooseProject: string;
  };
  // TODO: linux等系统无法通过node的子进程操作父进程目录 可考虑 ~/.bash_profile 内相关函数操作但是未能成功
  logger.event(`cd ${chooseProject}`);
}
