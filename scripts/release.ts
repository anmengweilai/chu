import getGitRepoInfo from 'git-repo-info';
import { join } from 'path';
import rimraf from 'rimraf';
import 'zx/globals';
import { logger } from '../packages/utils/src';
import { PATHS } from './.internal/constants';
import { assert, eachPkg, getPkgs } from './.internal/utils';
// import { assert, getPkgs } from './.internal/utils';

(async () => {
  const gitRepoInfo = getGitRepoInfo();
  const { branch } = gitRepoInfo;
  logger.info(`branch: ${branch}`);
  const pkgs = getPkgs();
  logger.info(`pkgs: ${pkgs.join(', ')}`);

  // check git status  检测文件较上级提交是否有更改
  logger.event('check git status');
  const isGitClean = (await $`git status --porcelain`).stdout.trim().length;
  assert(!isGitClean, 'git status is not clean');

  // check npm registry  检测本地npm注册地址是否为 https://registry.npmjs.org/
  logger.event('check npm registry');
  const registry = (await $`npm config get registry`).stdout.trim();
  assert(
    registry === 'https://registry.npmjs.org/',
    'npm registry is not https://registry.npmjs.org/',
  );

  // check package changed
  logger.event('check package changed');
  const changed = (await $`lerna changed --loglevel error`).stdout.trim();
  assert(changed, `no package is changed`);

  // check npm ownership 检测要提交的包与 当前npm是否有对应的 作者信息
  logger.event('check npm ownership');
  const whoami = (await $`npm whoami`).stdout.trim();
  logger.event(`whoami : ${whoami}`);
  await Promise.all(
    ['@anmeng/chu'].map(async (pkg) => {
      const owners = (await $`npm owner ls ${pkg}`).stdout
        .trim()
        .split('\n')
        .map((line) => {
          return line.split(' ')[0];
        });
      assert(owners.includes(whoami), `${pkg} is not owned by ${whoami}`);
    }),
  );

  // check package.json  检验项目文件完整性
  logger.event('check package.json info');
  await $`npm run check:packageFiles`;

  // clean
  logger.event('clean');
  eachPkg(pkgs, ({ dir, name }) => {
    logger.info(`clean dist of ${name}`);
    rimraf.sync(join(dir, 'dist'));
  });

  // build packages
  logger.event('build packages');
  await $`npm run build:release`;
  // await $`npm run build:extra`;
  //
  // logger.event('check client code change');
  // const isGitCleanAfterClientBuild = (
  //   await $`git status --porcelain`
  // ).stdout.trim().length;
  // assert(!isGitCleanAfterClientBuild, 'client code is updated');

  // generate changelog
  // TODO 创建  generate changelog
  logger.event('generate changelog');

  // bump version
  logger.event('bump version');
  await $`lerna version --exact --no-commit-hooks --no-git-tag-version --no-push --loglevel error`;
  const version = require(PATHS.LERNA_CONFIG).version;
  let tag = 'latest';
  if (
    version.includes('-alpha.') ||
    version.includes('-beta.') ||
    version.includes('-rc.')
  ) {
    tag = 'next';
  }
  if (version.includes('-canary.')) tag = 'canary';

  // update example versions
  // logger.event('update example versions');
  // const examplesDir = PATHS.EXAMPLES;
  // const examples = fs.readdirSync(examplesDir).filter((dir) => {
  //   return (
  //     !dir.startsWith('.') && existsSync(join(examplesDir, dir, 'package.json'))
  //   );
  // });
  // examples.forEach((example) => {
  //   const pkg = require(join(examplesDir, example, 'package.json'));
  //   pkg.scripts ||= {};
  //   pkg.scripts['start'] = 'npm run dev';
  //   // change deps version
  //   setDepsVersion({
  //     pkg,
  //     version,
  //     deps: ['@anmeng/chu'],
  //   });
  //   delete pkg.version;
  //   fs.writeFileSync(
  //     join(examplesDir, example, 'package.json'),
  //     `${JSON.stringify(pkg, null, 2)}\n`,
  //   );
  // });

  // update pnpm lockfile
  logger.event('update pnpm lockfile');
  $.verbose = false;
  await $`pnpm i`;
  $.verbose = true;

  logger.event('setting file permission');
  await $`chmod -R 777 *`;

  logger.event('add -A');
  await $`git add -A`;

  // commit
  logger.event('commit');
  await $`git commit --all --message "release: ${version}"`;

  // git tag
  if (tag !== 'canary') {
    logger.event('git tag');
    await $`git tag v${version}`;
  }

  // git push
  logger.event('git push');
  await $`git push origin ${branch} --tags`;

  // npm publish
  logger.event('pnpm publish');
  $.verbose = false;
  const innerPkgs = pkgs.filter((pkg) => !['chu'].includes(pkg));

  // check 2fa config
  let otpArg: string[] = [];
  if (
    (await $`npm profile get "two-factor auth"`).toString().includes('writes')
  ) {
    let code = '';
    do {
      // get otp from user
      code = await question('This operation requires a one-time password: ');
      // generate arg for zx command
      // why use array? https://github.com/google/zx/blob/main/docs/quotes.md
      otpArg = ['--otp', code];
    } while (code.length !== 6);
  }

  await Promise.all(
    innerPkgs.map(async (pkg) => {
      await $`cd packages/${pkg} && npm publish --tag ${tag} ${otpArg}`;
      logger.info(`+ ${pkg}`);
    }),
  );
  await $`cd packages/chu && npm publish --tag ${tag} ${otpArg}`;
  logger.info(`+ @anmeng/chu`);
  // TODO 添加还需要发布的包

  $.verbose = true;

  // sync tnpm  不需要通知同步
  // logger.event('sync tnpm');
  // $.verbose = false;
  // await Promise.all(
  //   pkgs.map(async (pkg) => {
  //     const { name } = require(path.join(PATHS.PACKAGES, pkg, 'package.json'));
  //     logger.info(`sync ${name}`);
  //     await $`tnpm sync ${name}`;
  //   }),
  // );
  // $.verbose = true;
})();

// function setDepsVersion(opts: {
//   deps: string[];
//   pkg: Record<string, any>;
//   version: string;
// }) {
//   const { deps, pkg, version } = opts;
//   pkg.dependencies ||= {};
//   deps.forEach((dep) => {
//     if (pkg?.dependencies?.[dep]) {
//       pkg.dependencies[dep] = version;
//     }
//     if (pkg?.devDependencies?.[dep]) {
//       pkg.devDependencies[dep] = version;
//     }
//   });
//   return pkg;
// }
