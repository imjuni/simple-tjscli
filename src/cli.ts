import commandBuilder from '@cli/commandBuilder';
import tsjCommandBuilder from '@cli/tsjCommandBuilder';
import watchBuilder from '@cli/watchBuilder';
import getRequiredTjsOption from '@config/getRequiredTjsOption';
import getRequiredTsjOption from '@config/getRequiredTsjOption';
import ITjsOption from '@config/interfaces/ITjsOption';
import ITsjOption from '@config/interfaces/ITsjOption';
import preLoadConfig from '@config/preLoadConfig';
import logger from '@tools/logger';
import { isError } from 'my-easy-fp';
import yargsAnyType, { Argv } from 'yargs';
import { generateJSONSchemaUsingTJS, generateJSONSchemaUsingTSJ, watchJSONSchemaUsingTSJ } from './tjscli';

// Yargs default type using object type(= {}). But object type cause error that
// fast-maker cli option interface type. So we make concrete type yargs instance
// make using by any type.
const yargs: Argv<ITsjOption | ITjsOption> = yargsAnyType as any;
const log = logger();

const parser = yargs(process.argv.slice(2))
  .command<ITsjOption>({
    command: 'tsj',
    builder: (args) => {
      return [commandBuilder, tsjCommandBuilder].reduce((newArgs, func) => {
        return func(newArgs);
      }, args as any);
    },
    handler: async (args) => {
      try {
        const option = getRequiredTsjOption(args);
        await generateJSONSchemaUsingTSJ(option, true);
      } catch (catched) {
        const err = isError(catched) ?? new Error('unknown error raised');
        log.error(err);
      }
    },
  })
  .command<ITjsOption>({
    command: 'tjs',
    builder: (args) => {
      return commandBuilder(args) as any;
    },
    handler: async (args) => {
      try {
        const option = getRequiredTjsOption(args);
        await generateJSONSchemaUsingTJS(option, true);
      } catch (catched) {
        const err = isError(catched) ?? new Error('unknown error raised');
        log.error(err);
      }
    },
  })
  .command<ITsjOption>({
    command: 'tsj-w',
    builder: (args) => {
      return [commandBuilder, tsjCommandBuilder, watchBuilder].reduce((newArgs, func) => {
        return func(newArgs);
      }, args as any);
    },
    handler: async (args) => {
      try {
        const option = getRequiredTsjOption(args);
        watchJSONSchemaUsingTSJ(option, true);
      } catch (catched) {
        const err = isError(catched) ?? new Error('unknown error raised');
        log.error(err);
      }
    },
  })
  .demandCommand()
  .recommendCommands()
  .demandOption(['project'])
  .config(preLoadConfig())
  .help();

(async () => {
  await parser.argv;
  process.exit(0);
})();
