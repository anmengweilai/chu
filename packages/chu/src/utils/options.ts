import { createSchema, exit, fsExtra, logger, validate } from '@anmeng/utils';
import fs from 'fs';
import { getRcPath } from './rcFile';

const rcPath = getRcPath('.churc');

// @ts-ignore
const schema = createSchema((joi) => {
  return joi.object().keys({
    otherNpmSource: joi.object(),
    baseProjectsDirPaths: joi.array().items(joi.string()),
  });
});

const churcJson = {
  otherNpmSource: {},
  baseProjectsDirPaths: [],
};

let cachedOptions: any;
export const loadOptions = () => {
  if (cachedOptions) {
    return cachedOptions;
  }
  if (fs.existsSync(rcPath)) {
    try {
      cachedOptions = JSON.parse(fs.readFileSync(rcPath, 'utf-8'));
    } catch (e: any) {
      logger.error(
        `Error loading saved preferences: ` +
          `~/.churc may be corrupted or have syntax errors. ` +
          `Please fix/delete it and re-run chu-cli in manual mode.\n` +
          `(${e?.message})` +
          `templateJson：\n
          ${JSON.stringify(churcJson)}
          `,
      );
      exit(1);
    }
    validate(cachedOptions, schema, () => {
      logger.error(
        `~/.churc may be outdated. ` +
          `Please delete it and re-run chu-cli in manual mode.`,
      );
    });
    return cachedOptions;
  } else {
    fsExtra.writeFile(rcPath, JSON.stringify(churcJson), 'utf-8');
    logger.info(`~/.churc init success ！`);
    return {};
  }
};
