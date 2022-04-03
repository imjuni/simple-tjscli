import { ITjsCliOption } from '@interfaces/ITjsCliOption';
import configFileLoad from '@routines/configFileLoad';
import engineTjs from '@routines/engineTjs';
import engineTsj from '@routines/engineTsj';
import consola, { LogLevel } from 'consola';
import * as TEI from 'fp-ts/Either';
import { isFalse } from 'my-easy-fp';
import { existsSync } from 'my-node-fp';
import * as path from 'path';
import yargsAnyType, { Argv } from 'yargs';

// Yargs default type using object type(= {}). But object type cause error that
// fast-maker cli option interface type. So we make concrete type yargs instance
// make using by any type.
const yargs: Argv<ITjsCliOption> = yargsAnyType as any;
consola.level = LogLevel.Success;

// eslint-disable-next-line
const argv = yargs(process.argv.slice(2))
  .command<ITjsCliOption>({
    command: '$0 [cwds...]',
    aliases: 'tsj [cwds...]',
    builder: (args: Argv<ITjsCliOption>) => {
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

      return args;
    },
    handler: async (args) => {
      try {
        const cwd = args.cwd ?? process.cwd();
        const configLoaded = await configFileLoad({ cwd });
        const config: { [key: string]: any } = TEI.isRight(configLoaded) ? configLoaded.right : {};
        const project = process.env.TS_NODE_PROJECT ?? config.project ?? path.join(process.cwd(), 'tsconfig.json');

        if (isFalse(existsSync(path.resolve(project)))) {
          consola.error(new Error(`Error: invalid tsconfig path - ${project}`));
          process.exit(1);
        }

        // Change working directory path
        const resolvedProject = path.resolve(project);
        const tsconfigPath = path.resolve(path.dirname(project));
        process.chdir(tsconfigPath);

        consola.debug('Path-1: ', project, tsconfigPath, resolvedProject);

        const option: ITjsCliOption = {
          engine: 'tsj',
          project: resolvedProject,
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
          consola.error(result.left);
          process.exit(1);
        }

        consola.debug('entered-tsj: ', option);
      } catch (catched) {
        const err = catched instanceof Error ? catched : new Error('unknown error raised');
        consola.error(err);
      }
    },
  })
  .command<ITjsCliOption>({
    command: 'tjs [cwds...]',
    builder: (args: Argv<ITjsCliOption>) => args,
    handler: async (args) => {
      try {
        const cwd = args.cwd ?? process.cwd();
        const configLoaded = await configFileLoad({ cwd });
        const config: { [key: string]: any } = TEI.isRight(configLoaded) ? configLoaded.right : {};
        const project = process.env.TS_NODE_PROJECT ?? config.project ?? path.join(process.cwd(), 'tsconfig.json');

        if (isFalse(existsSync(path.resolve(project)))) {
          consola.error(new Error(`Error: invalid tsconfig path - ${project}`));
          process.exit(1);
        }

        // Change working directory path
        const resolvedProject = path.resolve(project);
        const tsconfigPath = path.resolve(path.dirname(project));
        process.chdir(tsconfigPath);

        consola.debug('Path-2: ', project, tsconfigPath, path.resolve(project));

        const option: ITjsCliOption = {
          engine: 'tjs',
          project: resolvedProject,
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
          consola.error(result.left);
          process.exit(1);
        }

        consola.debug('entered-tjs: ', option);
      } catch (catched) {
        const err = catched instanceof Error ? catched : new Error('unknown error raised');
        consola.error(err);
      }
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

consola.debug('테스트: ', 'filenames' in argv ? argv.files : 'empty');
consola.debug('테스트: ', argv);
consola.debug('테스트: ', process.env.DEBUG);
