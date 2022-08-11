import { ChoiceOptions } from 'inquirer';

let pathPromptModules = (choices: ChoiceOptions[]) => {
  return {
    name: 'npmRunScript',
    type: 'list',
    message: 'please choose need npm scripts',
    description: 'List of items under the scripts',
    choices: choices,
  };
};
export default pathPromptModules;
