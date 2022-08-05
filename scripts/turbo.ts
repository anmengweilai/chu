import { PATHS } from './.internal/constants';
import { spawnSync } from './.internal/utils';

(async () => {
  const args = process.argv.slice(2);

  // noe cache
  if (args.includes('--no-cache')) {
    args.unshift('--force');
  }

  //filter
  if (args.includes('--filter')) {
    // Tips: 这里应该使用双引号 单引号在windows上是无效的
    args.unshift('--filter', `"./packages/*"`);
  }

  // turbo cache
  if (!args.includes('--cache-dir')) {
    args.unshift('--cache-dir', `".turbo"`);
  }

  const command = `turbo run ${args.join(' ')}`;

  spawnSync(command, { cwd: PATHS.ROOT });
})();
