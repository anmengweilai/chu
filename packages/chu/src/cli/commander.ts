import { chalk, commander, leven } from '@chu/utils';
import { configure } from './config';
import goToProject from './goToProject';
import { settingNpmRegistry } from './setting';

const { Command } = commander;
const program = new Command();

export const settingCommandsOptions = async () => {
  program
    .version(`@chu/cli ${require('../../package.json').version}`)
    .usage('<command> [options]');

  // @ts-ignore
  program
    .command('setting')
    .description('setup development environment ')
    .option('-c,-choose <registry-name>', 'choose need npm registry url')
    .action((value) => {
      settingNpmRegistry(value);
    });

  // @ts-ignore
  program
    .command('config [value]')
    .description('inspect and modify the config')
    .option('-g, --get <path>', 'get value from option')
    .option('-s, --set <path> <value>', 'set option value')
    .option('-d, --delete <path>', 'delete option from config')
    .option('-e, --edit', 'open config with default editor')
    .option('--json', 'outputs JSON result only')
    .action(async (value: string, options: any) => {
      await configure(value, options);
    });

  // @ts-ignore
  program
    .command('project')
    .description('go to need project')
    .option('-f , --filter <value>', 'filter project')
    .option('-c , --choose', 'choose project')
    .action(async (value: any, options: any) => {
      await goToProject(value, options);
    });

  // output help information on unknown commands
  program.on('command:*', ([cmd]: any[]) => {
    program.outputHelp();
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
    console.log();
    suggestCommands(cmd);
    process.exit(1);
  });

  // add some useful info on help
  program.on('--help', () => {
    console.log();
    console.log(
      `  Run ${chalk.cyan(
        `chu <command> --help`,
      )} for detailed usage of given command.`,
    );
    console.log();
  });

  program.commands.forEach((c) => c.on('--help', () => console.log()));
  program.parse(process.argv);
};

function suggestCommands(unknownCommand: string) {
  const availableCommands = program.commands.map((cmd) => {
    return cmd.name();
  });

  let suggestion: string | undefined;

  availableCommands.forEach((cmd) => {
    const isBestMatch =
      leven(cmd, unknownCommand) < leven(suggestion || '', unknownCommand);
    if (leven(cmd, unknownCommand) < 3 && isBestMatch) {
      suggestion = cmd;
    }
  });

  if (suggestion) {
    console.log(`  ` + chalk.red(`Did you mean ${chalk.yellow(suggestion)}?`));
  }
}
