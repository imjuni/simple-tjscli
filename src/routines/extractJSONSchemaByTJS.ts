import { ICreateSchemaTarget } from '@interfaces/ICreateSchemaTarget';
import { ITjsCliOption } from '@interfaces/ITjsCliOption';
import prettierProcessing from '@routines/prettierProcessing';
import chalk from 'chalk';
import consola from 'consola';
import console from 'console';
import * as TEI from 'fp-ts/Either';
import fs from 'fs';
import { isNotEmpty } from 'my-easy-fp';
import path from 'path';
import typescript from 'typescript';
import * as TJS from 'typescript-json-schema';
import util from 'util';

function getOutputDir({ target, option }: { target: ICreateSchemaTarget; option: ITjsCliOption }) {
  if (option.output !== '' && isNotEmpty(option.output)) {
    return option.output;
  }

  const fullPath = path.join(option.cwd, target.file);
  const outputDir = path.dirname(fullPath);

  return outputDir;
}

export default async function extractJSONSchemaByTJS({
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

    consola.debug(format);
    consola.debug(`type: ${option.outputType} / dd: ${target.file} / dir: ${outputDir} / file: ${filename}`);

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
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.debug(err);

    return TEI.left(err);
  }
}
