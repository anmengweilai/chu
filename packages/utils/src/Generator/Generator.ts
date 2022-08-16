import { dirname, join, relative } from 'path';
import chalk from '../../compiled/chalk';
import {
  copyFileSync,
  mkdirpSync,
  readFileSync,
  statSync,
  writeFileSync,
} from '../../compiled/fs-extra';
import { glob } from '../../compiled/glob';
import Mustache from '../../compiled/mustache';

/**
 * 用与 生成 tpl -> ts | js | scss ...
 */

interface IOpts {
  baseDir: string;
  args: string[];
}

class Generator {
  baseDir: string;
  args: string[];
  prompts: any;

  constructor({ baseDir, args }: IOpts) {
    this.baseDir = baseDir;
    this.args = args;
    this.prompts = {};
  }

  copyTpl(opts: { templatePath: string; target: string; context: object }) {
    const tpl = readFileSync(opts.templatePath, { encoding: 'utf-8' });
    const content = Mustache.render(tpl, opts.context);
    mkdirpSync(dirname(opts.target));
    console.log(
      `${chalk.green('Write:')} ${relative(this.baseDir, opts.target)}`,
    );
    writeFileSync(opts.target, content, 'utf-8');
  }

  copyDirectory(opts: { path: string; target: string; context: object }) {
    const files = glob.sync('**/*', {
      cwd: opts.path,
      dot: true,
      ignore: ['**/node_modules/**'],
    });
    files.forEach((file: any) => {
      const absFile = join(opts.path, file);
      if (statSync(absFile).isDirectory()) return;
      if (file.endsWith('.tpl')) {
        this.copyTpl({
          templatePath: absFile,
          target: join(opts.target, file.replace(/\.tpl$/, '')),
          context: opts.context,
        });
      } else {
        console.log(`${chalk.green('Copy: ')} ${file}`);
        const absTarget = join(opts.target, file);
        mkdirpSync(dirname(absTarget));
        copyFileSync(absFile, absTarget);
      }
    });
  }
}

export default Generator;
