import chalk from 'chalk';
import debug from 'debug';
import * as TEI from 'fp-ts/Either';
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
      args.option('extraTags', {
        alias: 'a',
        describe: 'TJS option extraTags',
        type: 'array',
      });

      args.option('jsDoc', {
        alias: 'd',
        describe: 'TJS option jsDoc',
        type: 'string',
      });

      args.option('expose', {
        alias: 'e',
        describe: 'TJS optin expose',
        type: 'string',
      });

      args.option('additionalProperties', {
        alias: 'n',
        describe: 'TJS optin additionalProperties',
        type: 'boolean',
      });

      const _args: any = args;

      return _args;
    },
    handler: async (args) => {
      try {
        const cwd = args.cwd ?? process.cwd();
        const configLoaded = await configFileLoad({ cwd });
        const config: { [key: string]: any } = TEI.isRight(configLoaded) ? configLoaded.right : {};

        const option: ITjsCliOption = {
          engine: 'tsj',
          project: process.env.TS_NODE_PROJECT ?? config.project ?? path.join(process.cwd(), 'tsconfig.json'),
          files: args.files ?? config.files ?? [],
          types: args.types ?? config.types ?? [],
          output: args.output ?? config.output ?? undefined,
          outputType: args.outputType ?? config.outputType ?? 'ts',
          prefix: args.prefix ?? config.prefix ?? 'JSC_',
          formatPath: args.formatPath ?? config.formatPath ?? undefined,
          topRef: args.topRef ?? config.topRef ?? false,
          cwd: args.cwd ?? config.cwd ?? process.cwd(),
          expose: args.expose ?? config.expose ?? 'export',
          jsDoc: args.jsDoc ?? config.jsDoc ?? 'extended',
          extraTags: args.extraTags ?? config.extraTags ?? [],
          additionalProperties: args.additionalProperties ?? config.additionalProperties ?? false,
        };

        const result = await engineTsj(config.format, option);

        if (TEI.isLeft(result)) {
          console.log(chalk.red('Error: ', result.left.message));
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
      const _args: any = args;
      return _args;
    },
    handler: async (args) => {
      const cwd = args.cwd ?? process.cwd();
      const configLoaded = await configFileLoad({ cwd });
      const config: { [key: string]: any } = TEI.isRight(configLoaded) ? configLoaded.right : {};

      const option: ITjsCliOption = {
        engine: 'tjs',
        project: process.env.TS_NODE_PROJECT ?? path.join(process.cwd(), 'tsconfig.json'),
        files: args.files ?? config.files ?? [],
        types: args.types ?? config.types ?? [],
        output: args.output ?? config.output ?? undefined,
        outputType: args.outputType ?? config.outputType ?? 'ts',
        prefix: args.prefix ?? config.prefix ?? 'JSC_',
        formatPath: args.formatPath ?? config.formatPath ?? undefined,
        additionalProperties: args.additionalProperties ?? config.additionalProperties ?? false,
        topRef: args.topRef ?? config.topRef ?? false,
        cwd: args.cwd ?? config.cwd ?? process.cwd(),
      };

      const result = await engineTjs(config.format, option);

      if (TEI.isLeft(result)) {
        console.log(chalk.red('Error: ', result.left.message));
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
  .option('output-type', {
    alias: 'u',
    describe: "output-type: 'json' or 'ts', default ts",
    type: 'string',
  })
  .option('output', {
    alias: 'o',
    describe: 'output directory',
    type: 'string',
  })
  .option('prefix', {
    alias: 'x',
    describe: "prefix of output filename, default 'JSC_'",
    type: 'string',
  })
  .option('format', {
    alias: 'r',
    describe: 'output contents layout',
    type: 'string',
  })
  .help().argv;

log('테스트: ', argv.filenames);
log('테스트: ', argv.interfaces);
log('테스트: ', process.env.DEBUG);
