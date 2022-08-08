import { ChoiceOptions } from 'inquirer';

let pathPromptModules = (choices: ChoiceOptions[]) => {
  return {
    name: 'chooseProject',
    type: 'list',
    message: 'please choose need project',
    description: 'List of items under the path',
    choices: choices,
  };
};
export default pathPromptModules;
