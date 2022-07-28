import { argv } from 'zx';
import 'zx/globals';

export async function buildDep(opts: any) {
  console.log(opts);
}
/**
 * 编译打包 package.json 文件中 compiledConfig 配置的依赖库
 */
(async () => {
  const base = process.cwd();
  const pkg = fs.readJSONSync(path.join(base, 'package.json'));
  const pkgDeps = pkg.dependencies || {};

  const {
    deps,
    externals = {},
    noMinify = [],
    extraDtsDeps = [],
    extraDtsExternals = [],
    excludeDtsDeps = [],
  } = pkg.compiledConfig;

  const webpackExternals: Record<string, string> = {};
  const dtsExternals = [...extraDtsDeps, ...extraDtsExternals];
  Object.keys(externals).forEach((name) => {
    const val = externals[name];
    if (val === '$$LOCAL') {
      dtsExternals.push(name);
      webpackExternals[name] = `${pkg.name}/compiled/${name}`;
    } else {
      webpackExternals[name] = val;
    }
  });

  for (const dep of argv.dep
    ? [argv.dep]
    : argv['extra-dts-only']
    ? extraDtsDeps
    : deps.concat(extraDtsDeps)) {
    const isDep = dep.charAt(0) !== '.';

    await buildDep({
      ...(isDep ? { packageName: dep } : { file: dep }),
      target: `compiled/${isDep ? dep : path.basename(path.dirname(dep))}`,
      base,
      webpackExternals,
      dtsExternals,
      clean: argv.clean,
      minify: !noMinify.includes(dep),
      dtsOnly: extraDtsDeps.includes(dep),
      noDts: excludeDtsDeps.includes(dep),
      isDependency: dep in pkgDeps,
    });
  }
})();
