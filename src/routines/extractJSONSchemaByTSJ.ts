import chalk from 'chalk';
import debug from 'debug';
import fs from 'fs';
import { efail, Either, epass, isEmpty, isFail, isNotEmpty } from 'my-easy-fp';
import path from 'path';
import * as TSJ from 'ts-json-schema-generator';
import util from 'util';
import { ICreateSchemaTarget } from '../interfaces/ICreateSchemaTarget';
import { ITjsCliOption } from '../interfaces/ITjsCliOption';
import { prettierProcessing } from './prettierProcessing';

const log = debug('tjscli:extractJSONSchemaByTSJ');

function getOutputDir({ target, option }: { target: ICreateSchemaTarget; option: ITjsCliOption }) {
  if (option.output !== '' && isNotEmpty(option.output)) {
    return option.output;
  }

  const fullPath = path.join(option.cwd, target.file);
  const outputDir = path.dirname(fullPath);

  return outputDir;
}

export async function extractJSONSchemaByTSJ({
  target,
  option,
  format,
}: {
  option: ITjsCliOption;
  target: ICreateSchemaTarget;
  format: string | undefined;
}): Promise<Either<boolean, Error>> {
  try {
    log('Project Path: ', option.project);
    log('A: ', path.resolve(path.join(option.cwd, option.project)));

    const writeFile = util.promisify(fs.writeFile);
    const generator = TSJ.createGenerator({
      path: path.join(option.cwd, target.file),
      tsconfig: option.project,
      type: target.type,
      expose: 'export',
      jsDoc: 'extended',
      topRef: option.topRef ?? false,
    });

    const schema = generator.createSchema(target.type);
    const schemaJSON = JSON.stringify(schema, null, 2);
    const outputDir = getOutputDir({ target, option });
    const fileType = isEmpty(format) ? 'json' : 'ts';
    const filename = `${option.prefix ?? ''}${target.type}.${fileType}`;

    log(format);
    log(`dd: ${target.file} / dir: ${outputDir} / file: ${filename}`);

    const contents =
      fileType === 'ts' && format !== undefined
        ? await prettierProcessing({ format, target, contents: schemaJSON, option })
        : epass(schemaJSON);

    if (isFail(contents)) {
      return efail(contents.fail);
    }

    const outputFilename = path.join(outputDir, filename);
    await writeFile(outputFilename, contents.pass);

    console.log(chalk.green('Write JSONSchema: ', outputFilename));

    return epass(true);
  } catch (err) {
    log(err.message);
    log(err.stack);

    return efail(err);
  }
}
