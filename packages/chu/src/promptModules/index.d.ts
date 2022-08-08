import type { ChoiceOptions } from 'inquirer';

export type PromptModuleType = {
  name: string;
  type: string;
  message: string;
  description: string;
  choices: ChoiceOptions[];
};
