import ITsjOption from '@config/interfaces/ITsjOption';
import { Argv } from 'yargs';

export default function tsjCommandBuilder(args: Argv<ITsjOption>) {
  args
    .option('seperateDefinitions', {
      describe: 'JSONSchema.definitions aggregate on seperate file: definitions.ts',
      type: 'boolean',
    })
    .option('skipTypeCheck', {
      describe: 'ts-json-schema-generator option: skipTypeCheck',
      type: 'boolean',
    })
    .option('topRef', {
      describe: 'ts-json-schema-generator option: topRef',
      type: 'boolean',
    })
    .option('expose', {
      describe: 'ts-json-schema-generator option: expose',
      choices: ['all', 'none', 'export'],
      type: 'string',
    })
    .option('jsDoc', {
      describe: 'ts-json-schema-generator option: jsDoc',
      choices: ['none', 'extended', 'basic'],
      type: 'string',
    })
    .option('extraTags', {
      describe: 'ts-json-schema-generator option: extraTagss',
      array: true,
      type: 'string',
    })
    .option('additionalProperties', {
      describe: 'ts-json-schema-generator option: additionalProperties',
      type: 'boolean',
    });

  return args;
}
