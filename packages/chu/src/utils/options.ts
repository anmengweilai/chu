import { createSchema, exit, logger, validate } from '@chu/utils';
import fs from 'fs';
import { getRcPath } from './rcFile';

const rcPath = getRcPath('.churc');

const schema = createSchema((joi: any) => {
  return joi.object().keys({
    otherNpmSource: joi.object(),
  });
});

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
          `(${e?.message})`,
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
    return {};
  }
};
