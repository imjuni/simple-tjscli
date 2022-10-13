import ITjsOption from '@config/interfaces/ITjsOption';
import ITsjOption from '@config/interfaces/ITsjOption';
import { Argv } from 'yargs';

export default function commandBuilder<T extends ITjsOption | ITsjOption>(args: Argv<T>) {
  args
    .option('cwd', {
      alias: 'w',
      describe: 'tjscli script working directory',
      type: 'string',
      default: process.cwd(),
    })
    .option('config', {
      alias: 'c',
      describe: '.tjsclirc configuration path',
      type: 'string',
    })
    .option('project', {
      alias: 'p',
      describe: 'project(tsconfig.json) file path',
      type: 'string',
    })
    .option('files', {
      alias: 'f',
      describe: 'input files for genrate json-schema',
      array: true,
      type: 'string',
      default: [],
    })
    .option('types', {
      alias: 't',
      describe: 'input types for genrate json-schema',
      array: true,
      type: 'string',
      default: [],
    })
    .option('sync', {
      alias: 's',
      describe: 'if set output directory after sync option create directory like input file directory structure',
      type: 'boolean',
      default: false,
    })
    .option('interactive', {
      alias: 'i',
      describe: 'interactive option show interactive cli interface what files, types option is empty',
      type: 'boolean',
      default: true,
    })
    .option('noBanner', {
      alias: 'b',
      describe: 'disable banner on top line',
      type: 'boolean',
      default: true,
    })
    .option('outputType', {
      alias: 'u',
      describe: 'output jsonschema file type ts: typescript file, json: json file',
      choices: ['json', 'ts'],
      type: 'string',
      default: 'json',
    })
    .option('output', {
      alias: 'o',
      describe: 'output directory',
      type: 'string',
    })
    .option('prefix', {
      alias: 'x',
      describe: "filename prefix in JSONSchema, if you do not use output, sync option that recommand set 'JSC_' ",
      type: 'string',
    })
    .option('extName', {
      alias: 'e',
      describe: 'if outputType set true that option using output file extname',
      type: 'string',
    })
    .option('template', {
      describe: "if you outputType set 'ts', template option usnig typescript source code template",
      type: 'string',
    })
    .option('templatePath', {
      describe: "if you outputType set 'ts', templatePath option usnig typescript source code template",
      type: 'string',
    })
    .option('skipError', {
      describe: '',
      type: 'boolean',
      default: false,
    })
    .option('verbose', {
      alias: 'v',
      describe: 'verbose message',
      type: 'boolean',
      default: false,
    });

  return args;
}
