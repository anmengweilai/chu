import { chalk, commander } from '@chu/utils';
import { settingConfigure } from './config';

const { Command } = commander;
const program = new Command();

export const settingCommandsOptions = () => {
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
      await settingConfigure(value, options);
    });

  // output help information on unknown commands
  program.on('command:*', ([cmd]: any[]) => {
    program.outputHelp();
    console.log(`  ` + chalk.red(`Unknown command ${chalk.yellow(cmd)}.`));
    console.log();
    // suggestCommands(cmd);
    process.exitCode = 1;
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

  program
    .version(`@chu/cli ${require('../../package.json').version}`)
    .usage('<command> [options]');

  program.commands.forEach((c) => c.on('--help', () => console.log()));
  program.parse(process.argv);
};
