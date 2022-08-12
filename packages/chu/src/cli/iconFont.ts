import {
  axios,
  chalk,
  deepmerge,
  exit,
  fsExtra,
  isLocalDev,
  logger,
} from '@chu/utils';
import type { AxiosRequestConfig } from '@chu/utils/compiled/axios';
import { join } from 'path';
import { DEFAULT_CHU_ICON_FONT_FILE_NAME } from '../constants';
import { checkConfigFile } from '../utils/checkConfigFile';

type iconfontType = 'Unicode' | 'FontClass' | 'Symbol';

type IconFontOptions = {
  name?: string;
  type?: iconfontType;
  path?: string;
};
type IconFontConfig = {
  name: string;
  type: iconfontType;
  path: string;
  unicode: { cdn: boolean; suffixes: suffixType[] };
  fontClass: { cdn: boolean };
  clear: boolean;
};

type suffixType = 'eot' | 'woff2' | 'woff' | 'ttf' | 'svg' | string;

const defConfig: IconFontConfig = {
  type: 'Symbol',
  path: 'src/assets/static/iconfont',
  name: 'IconFontConfig',
  unicode: {
    cdn: false,
    suffixes: ['eot', 'woff2', 'woff', 'ttf', 'svg'],
  },
  fontClass: {
    cdn: false,
  },
  clear: true,
};

const baseIconfontUrl = `https://at.alicdn.com/t/`;
const cdnIconfontUrl = `//at.alicdn.com/t/`;

export default async function (_value: any, _options: IconFontOptions) {
  /**
   * 1. 在第一次执行 chu iconfont 的时候会根据当前
   */
  // const cwd = process.cwd();

  let config = deepmerge(defConfig, _options) as IconFontConfig;

  if (checkConfigFile(DEFAULT_CHU_ICON_FONT_FILE_NAME, 'json')) {
    try {
      const jsonConfigData = fsExtra.readJSONSync(
        `${DEFAULT_CHU_ICON_FONT_FILE_NAME}.json`,
        'utf-8',
      );
      config = deepmerge(config, jsonConfigData);
    } catch (e: any) {
      logger.error(e.toString());
      exit(1);
    }
  } else {
    if (!_options?.name) {
      logger.error('Please input iconfontName');
      return exit(1);
    }
  }

  logger.clearConsole(`-------- Create iconfont ---------`);

  isLocalDev() && console.log({ config });

  if (config.type.toLocaleLowerCase() === 'Symbol'.toLocaleLowerCase()) {
    await useSymbolTypeIcon(config);
  } else if (
    config.type.toLocaleLowerCase() === 'Unicode'.toLocaleLowerCase()
  ) {
    await useUnicodeTypeIcon(config);
  } else if (
    config.type.toLocaleLowerCase() === 'FontClass'.toLocaleLowerCase()
  ) {
    await useFontClassTypeIcon(config);
  } else {
    logger.error('Use iconfont type error ！！！！');
  }

  logger.info(`${chalk.green('Success')}: write iconfont files ！`);
  logger.info(
    `For more ways to use it, please see ${chalk.green(
      'https://www.iconfont.cn/help/detail?helptype=code',
    )}`,
  );
}

const getResFile = async (url: string, options: AxiosRequestConfig = {}) => {
  logger.wait('Download iconfont file resources ...');
  try {
    const { data } = await axios.get(url, { ...options });
    return data;
  } catch (e: any) {
    logger.error(e.toString());
  }
};

const useUnicodeTypeIcon = async (config: IconFontConfig) => {
  const suffixes: suffixType[] = config.unicode.suffixes;
  const iconfontFiles = [];

  let baseClass = `.iconfont{
    font-family:"iconfont" !important;
    font-size:16px;font-style:normal;
    -webkit-font-smoothing: antialiased;
    -webkit-text-stroke-width: 0.2px;
    -moz-osx-font-smoothing: grayscale;\n}`;
  const baseSavePath = config.path;
  const saveCssPath = join(baseSavePath, 'iconfont.css');

  if (fsExtra.existsSync(saveCssPath)) {
    const iconfontData = fsExtra.readFileSync(saveCssPath, {
      encoding: 'utf-8',
    });
    const reg = /.iconfont{[\s\S]*?}/gi;
    const iconfontClass = iconfontData.match(reg);
    if (iconfontClass) {
      baseClass = iconfontClass[0];
    }
  }

  if (config.clear) {
    logger.event('Clear files ....');
    fsExtra.removeSync(config.path);
  }

  for (const suffix of suffixes) {
    const iconfontData = await getResFile(
      `${baseIconfontUrl}${config.name}.${suffix}`,
      { responseType: 'arraybuffer' },
    );
    if (!iconfontData) continue;
    const baseSavePath = config.path;
    const saveJsPath = join(baseSavePath, `${config.name}.${suffix}`);
    logger.wait(`Write iconfont file :${config.name}.${suffix}  ...`);
    fsExtra.ensureFileSync(saveJsPath);
    fsExtra.writeFileSync(saveJsPath, new Buffer(iconfontData), { mode: 777 });
    iconfontFiles.push(suffix);
  }

  const iconfontUrl = config.unicode.cdn
    ? `${cdnIconfontUrl}${config.name}`
    : `${config.name}`;

  let iconfontCss = `@font-face {\nfont-family: 'iconfont';\n src:`;
  let index = 0;
  for (const iconfontFile of iconfontFiles) {
    const start = index === 0 ? '' : '\n    ';
    const end = index === iconfontFiles.length - 1 ? ';' : ',';
    if (iconfontFile === 'eot') {
      iconfontCss = `${iconfontCss}${start}url('${iconfontUrl}.eot');\n src:url('${iconfontUrl}.eot?#iefix') format('embedded-opentype')${end}`;
    }
    if (iconfontFile === 'woff2') {
      iconfontCss = `${iconfontCss}${start}url('${iconfontUrl}.woff2') format('woff2')${end}`;
    }
    if (iconfontFile === 'woff') {
      iconfontCss = `${iconfontCss}${start}url('${iconfontUrl}.woff') format('woff')${end}`;
    }
    if (iconfontFile === 'ttf') {
      iconfontCss = `${iconfontCss}${start}url('${iconfontUrl}.ttf') format('truetype')${end}`;
    }
    if (iconfontFile === 'svg') {
      iconfontCss = `${iconfontCss}${start}url('${iconfontUrl}.svg#iconfont') format('svg')${end}`;
    }
    index++;
  }

  iconfontCss = `${iconfontCss}\n}\n ${baseClass}`;

  fsExtra.ensureFileSync(saveCssPath);
  fsExtra.writeFileSync(saveCssPath, iconfontCss, {
    encoding: 'utf-8',
  });
};

const useFontClassTypeIcon = async (config: IconFontConfig) => {
  if (config.clear) {
    logger.event('Clear files ....');
    fsExtra.removeSync(config.path);
  }

  const saveCssPath = join(config.path, 'iconfont.css');
  const iconfontCss = await getResFile(`${baseIconfontUrl}${config.name}.css`);

  fsExtra.ensureFileSync(saveCssPath);
  fsExtra.writeFileSync(saveCssPath, iconfontCss, {
    encoding: 'utf-8',
  });
};

const useSymbolTypeIcon = async (config: IconFontConfig) => {
  const iconfontData = await getResFile(baseIconfontUrl + config.name + '.js');
  const reg: RegExp = /id="[\s\S]*?"/g;
  const iconIdList = iconfontData
    .match(reg)
    .map((item: string) => `+ ${item.substring(4, item.length - 1)}\n`);

  const baseSavePath = config.path;
  const saveJsPath = join(baseSavePath, 'index.js');
  const saveMdPath = join(baseSavePath, 'iconfont.md');
  logger.info('Write iconfont file ...');
  fsExtra.ensureFileSync(saveJsPath);
  fsExtra.writeFileSync(saveJsPath, iconfontData, {
    encoding: 'utf-8',
  });

  logger.wait('Write iconfont.md ...');
  fsExtra.ensureFileSync(saveMdPath);
  fsExtra.writeFileSync(saveMdPath, iconIdList.join(''), {
    encoding: 'utf-8',
  });
};
