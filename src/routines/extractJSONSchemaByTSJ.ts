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
import * as TSJ from 'ts-json-schema-generator';
import util from 'util';

function getOutputDir({ target, option }: { target: ICreateSchemaTarget; option: ITjsCliOption }) {
  if (option.output !== '' && isNotEmpty(option.output)) {
    return option.output;
  }

  const fullPath = path.join(option.cwd, target.file);
  const outputDir = path.dirname(fullPath);

  return outputDir;
}

export default async function extractJSONSchemaByTSJ({
  target,
  option,
  format,
}: {
  option: ITjsCliOption;
  target: ICreateSchemaTarget;
  format: string | undefined;
}): Promise<TEI.Either<Error, boolean>> {
  try {
    const writeFile = util.promisify(fs.writeFile);

    consola.debug('Project Path: ', option.project);
    consola.debug('A: ', option.project);

    consola.debug('B: ', {
      path: path.join(option.cwd, target.file),
      tsconfig: option.project,
      type: target.type,
      expose: option.expose ?? 'export',
      jsDoc: option.jsDoc ?? 'extended',
      topRef: option.topRef ?? false,
      skipTypeCheck: option.skipTypeCheck ?? false,
      extraTags: option.extraTags ?? [],
      additionalProperties: option.additionalProperties ?? false,
    });

    const generator = TSJ.createGenerator({
      path: path.join(option.cwd, target.file),
      tsconfig: option.project,
      type: target.type,
      expose: option.expose ?? 'export',
      jsDoc: option.jsDoc ?? 'extended',
      topRef: option.topRef ?? false,
      skipTypeCheck: option.skipTypeCheck ?? false,
      extraTags: option.extraTags ?? [],
      additionalProperties: option.additionalProperties ?? false,
    });

    consola.debug('topRef: ', option.topRef ?? false);

    const schema = generator.createSchema(target.type);
    const schemaJSON = JSON.stringify(schema, null, 2);
    const outputDir = getOutputDir({ target, option });
    const fileType = option.outputType;
    const filename = `${option.prefix ?? ''}${target.type}.${fileType}`;

    consola.debug('format: ', format);
    consola.debug(`type: ${option.outputType} / dd: ${target.file} / dir: ${outputDir} / file: ${filename}`);

    const contents =
      fileType === 'ts'
        ? await prettierProcessing({
            format,
            filename: target.type,
            target,
            contents: schemaJSON,
            option,
          })
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
    const newError = new Error(`[${target.file}/${target.type}]${err.message}`);

    consola.debug(newError);

    return TEI.left(newError);
  }
}
