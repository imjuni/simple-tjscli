import chalk from 'chalk';
import debug from 'debug';
import { isPass, isFail } from 'my-easy-fp';
import * as path from 'path';
import yargs, { Argv } from 'yargs';
import { ITjsCliOption } from './interfaces/ITjsCliOption';
import { configFileLoad } from './routines/configFileLoad';
import { engineTjs } from './routines/engineTjs';
import { engineTsj } from './routines/engineTsj';

const log = debug('tjscli:cli');

// tslint:disable-next-line
const argv = yargs
  .command<ITjsCliOption>({
    command: '$0 [cwds...]',
    aliases: 'tsj [cwds...]',
    builder: (args: Argv<{}>) => {
      const _args: any = args;
      return _args;
    },
    handler: async (args) => {
      try {
        const cwd = args.cwd ?? process.cwd();
        const configLoaded = await configFileLoad({ cwd });
        const config: { [key: string]: any } = isPass(configLoaded) ? configLoaded.pass : {};

        const option: ITjsCliOption = {
          engine: 'tsj',
          project: process.env.TS_NODE_PROJECT ?? config.project ?? path.join(process.cwd(), 'tsconfig.json'),
          files: args.files ?? config.files ?? [],
          types: args.types ?? config.types ?? [],
          output: args.output ?? config.output ?? undefined,
          prefix: args.prefix ?? config.prefix ?? 'JSC_',
          formatPath: args.formatPath ?? config.formatPath ?? undefined,
          topRef: args.topRef ?? config.topRef ?? false,
          cwd: args.cwd ?? config.cwd ?? process.cwd(),
        };

        const result = await engineTsj(config.format, option);

        if (isFail(result)) {
          console.log(chalk.red('Error: ', result.fail.message));
        }

        log('entered-tsj: ', option);
      } catch (err) {
        console.log(chalk.red('Error caused: '));
        console.log(err.message);
      }
    },
  })
  .command<ITjsCliOption>({
    command: 'tjs [cwds...]',
    builder: (args: Argv<{}>) => {
      args.option('files', {
        alias: 'f',
        describe: 'export list create filefirst, no option false, option true',
        type: 'array',
      });

      const _args: any = args;
      return _args;
    },
    handler: async (args) => {
      const cwd = args.cwd ?? process.cwd();
      const configLoaded = await configFileLoad({ cwd });
      const config: { [key: string]: any } = isPass(configLoaded) ? configLoaded.pass : {};

      const option: ITjsCliOption = {
        engine: 'tsj',
        project: process.env.TS_NODE_PROJECT ?? path.join(process.cwd(), 'tsconfig.json'),
        files: args.files ?? config.files ?? [],
        types: args.types ?? config.types ?? [],
        output: args.output ?? config.output ?? undefined,
        prefix: args.prefix ?? config.prefix ?? 'JSC_',
        formatPath: args.formatPath ?? config.formatPath ?? undefined,
        topRef: args.topRef ?? config.topRef ?? false,
        cwd: args.cwd ?? config.cwd ?? process.cwd(),
      };

      const result = await engineTjs(config.format, option);

      if (isFail(result)) {
        console.log(chalk.red('Error: ', result.fail.message));
      }

      log('entered-tjs: ', option);
    },
  })
  .option('files', {
    alias: 'f',
    describe: 'target file for schema extraction',
    type: 'array',
  })
  .option('types', {
    alias: 't',
    describe: 'interface or type alias name in target file',
    type: 'array',
  })
  .option('project', {
    alias: 'p',
    describe: 'project path',
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    describe: 'output directory',
    type: 'string',
  })
  .option('prefix', {
    alias: 'x',
    describe: '',
    type: 'string',
  })
  .option('format', {
    alias: 'r',
    describe: '',
    type: 'string',
  })
  .help().argv;

log('테스트: ', argv.filenames);
log('테스트: ', argv.interfaces);
log('테스트: ', process.env.DEBUG);
