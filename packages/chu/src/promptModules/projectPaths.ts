import { ChoiceOptions } from 'inquirer';

let pathPromptModules = (choices: ChoiceOptions[], currentPath = 'unknown') => {
  return {
    name: 'chooseProject',
    type: 'list',
    message: `please choose need project, ${currentPath}`,
    description: 'List of items under the path',
    choices: choices,
  };
};
export default pathPromptModules;
