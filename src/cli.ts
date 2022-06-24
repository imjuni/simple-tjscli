import commandBuilder from '@cli/commandBuilder';
import tsjCommandBuilder from '@cli/tsjCommandBuilder';
import watchBuilder from '@cli/watchBuilder';
import getRequiredTjsOption from '@config/getRequiredTjsOption';
import getRequiredTsjOption from '@config/getRequiredTsjOption';
import ITjsOption from '@config/interfaces/ITjsOption';
import ITsjOption from '@config/interfaces/ITsjOption';
import preLoadConfig from '@config/preLoadConfig';
import consola, { LogLevel } from 'consola';
import { isError } from 'my-easy-fp';
import yargsAnyType, { Argv } from 'yargs';
import { generateJSONSchemaUsingTJS, generateJSONSchemaUsingTSJ, watchJSONSchemaUsingTSJ } from './tjscli';

// Yargs default type using object type(= {}). But object type cause error that
// fast-maker cli option interface type. So we make concrete type yargs instance
// make using by any type.
const yargs: Argv<ITsjOption | ITjsOption> = yargsAnyType as any;
consola.level = LogLevel.Success;

// eslint-disable-next-line
const argv = yargs(process.argv.slice(2))
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
        consola.error(err);
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
        consola.error(err);
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

        watchJSONSchemaUsingTSJ(option);
      } catch (catched) {
        const err = isError(catched) ?? new Error('unknown error raised');
        consola.error(err);
      }
    },
  })
  .demandCommand()
  .recommendCommands()
  .demandOption(['project'])
  .config(preLoadConfig())
  .help().argv;

consola.debug('테스트: ', 'filenames' in argv ? argv.files : 'empty');
consola.debug('테스트: ', argv);
consola.debug('테스트: ', process.env.DEBUG);
