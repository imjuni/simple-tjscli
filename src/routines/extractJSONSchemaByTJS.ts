import debug from 'debug';
import fs from 'fs';
import { efail, epass, isEmpty, isFail, isNotEmpty } from 'my-easy-fp';
import path from 'path';
import typescript from 'typescript';
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

    await writeFile(path.join(outputDir, filename), contents.pass);

    return epass(true);
  } catch (err) {
    log(err.message);
    log(err.stack);

    return efail(err);
  }
}
