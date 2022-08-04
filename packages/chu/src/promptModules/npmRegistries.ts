import { loadOptions } from '../utils/options';
const { otherNpmSource } = loadOptions();

export default {
  name: 'npmRegistries',
  type: 'list',
  message: 'please choose need npm registry url',
  description: 'npm registry url list',
  choices: [
    {
      name: 'NPM',
      value: 'https://registry.npmjs.org',
    },
    {
      name: 'Taobao',
      value: 'https://registry.npm.taobao.org',
    },
    {
      name: 'Petkit',
      value: 'http://npm.petkit.com',
    },
    ...Object.entries(otherNpmSource || {}).map(([name, value]) => {
      return {
        name,
        value,
      };
    }),
    {
      name: 'Current',
      value: '',
    },
  ],
} as PromptModule;
