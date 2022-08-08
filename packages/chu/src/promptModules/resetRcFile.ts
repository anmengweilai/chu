import { PromptModuleType } from './index';

export default {
  name: 'resetRcFile',
  type: 'list',
  message: 'please choose',
  description: '.churc',
  choices: [
    {
      name: 'Yes',
      value: true,
    },
    {
      name: 'No',
      value: false,
    },
  ],
} as PromptModuleType;
