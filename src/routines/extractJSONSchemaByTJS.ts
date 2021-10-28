import chalk from 'chalk';
import debug from 'debug';
import fs from 'fs';
import { isNotEmpty } from 'my-easy-fp';
import * as TEI from 'fp-ts/Either';
import path from 'path';
import typescript, { textSpanIsEmpty } from 'typescript';
import * as TJS from 'typescript-json-schema';
import util from 'util';
import { ICreateSchemaTarget } from '../interfaces/ICreateSchemaTarget';
import { ITjsCliOption } from '../interfaces/ITjsCliOption';
import { prettierProcessing } from './prettierProcessing';

const log = debug('tjscli:extractJSONSchemaByTJS');

function getOutputDir({ target, option }: { target: ICreateSchemaTarget; option: ITjsCliOption }) {
  if (option.output !== '' && isNotEmpty(option.output)) {
    return option.output;
  }

  const fullPath = path.join(option.cwd, target.file);
  const outputDir = path.dirname(fullPath);

  return outputDir;
}

export async function extractJSONSchemaByTJS({
  target,
  option,
  format,
}: {
  option: ITjsCliOption;
  target: ICreateSchemaTarget;
  format: string | undefined;
}) {
  try {
    const writeFile = util.promisify(fs.writeFile);
    const readFile = util.promisify(fs.readFile);

    const compilerOptions = typescript.parseConfigFileTextToJson(
      option.project,
      (await readFile(option.project)).toString(),
    );

    const settings: TJS.PartialArgs = {
      required: true,
      ignoreErrors: true,
      strictNullChecks: true,
    };

    const program = TJS.getProgramFromFiles([path.join(option.cwd, target.file)], compilerOptions);
    const schema = TJS.generateSchema(program, target.type, settings);

    const schemaJSON = JSON.stringify(schema, null, 2);
    const outputDir = getOutputDir({ target, option });
    const fileType = option.outputType;
    const filename = `${option.prefix ?? ''}${target.type}.${fileType}`;

    log(format);
    log(`type: ${option.outputType} / dd: ${target.file} / dir: ${outputDir} / file: ${filename}`);

    const contents =
      fileType === 'ts'
        ? await prettierProcessing({ format, filename: target.type, target, contents: schemaJSON, option })
        : TEI.right(schemaJSON);

    if (TEI.isLeft(contents)) {
      return TEI.left(contents.left);
    }

    const outputFilename = path.join(outputDir, filename);
    await writeFile(outputFilename, contents.right);

    console.log(chalk.green('Write JSONSchema: ', outputFilename));

    return TEI.right(true);
  } catch (err) {
    const refined = err instanceof Error ? err : new Error('unknown error raised');

    log(refined.message);
    log(refined.stack);

    return TEI.left(refined);
  }
}
