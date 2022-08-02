import { chalk, commander } from '@chu/utils';
import {
  checkLocal,
  checkVersion as checkNodeVersion,
  setNoDeprecation,
  setNodeTitle,
} from './node';

interface IOpts {
  presets?: string[];
}

const { program } = commander;

export async function run(opts?: IOpts) {
  console.log(opts);
  checkNodeVersion();
  checkLocal();
  setNodeTitle();
  setNoDeprecation();

  // const args = yParser(process.argv.slice(2), {
  //   alias: {
  //     version: ['v'],
  //     help: ['h'],
  //   },
  //   boolean: ['version'],
  // });
  //
  // const command = args._[0];
  // console.log(args, command);

  program
    .command('config [value]')
    .description('inspect and modify the config')
    .option('-g, --get <path>', 'get value from option')
    .option('-s, --set <path> <value>', 'set option value')
    .option('-d, --delete <path>', 'delete option from config')
    .option('-e, --edit', 'open config with default editor')
    .option('--json', 'outputs JSON result only')
    .action((value, options) => {
      console.log({ value, options });
      // require("../lib/config")(value, options);
    });

  // output help information on unknown commands
  program.on('command:*', ([cmd]) => {
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
    .version(`@chu/cli ${require('../../../../lerna.json').version}`)
    .usage('<command> [options]');

  program.commands.forEach((c) => c.on('--help', () => console.log()));
  program.parse(process.argv);
}
