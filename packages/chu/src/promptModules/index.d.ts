declare type PromptModule = {
  name: string;
  type: string;
  message: string;
  description: string;
  choices: { name: string; value: string }[];
};
