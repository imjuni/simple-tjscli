import type ITjsOption from '#config/interfaces/ITjsOption';
import getBanner from '#modules/getBanner';
import type IGeneratedJSONSchemaFromTJS from '#modules/interfaces/IGeneratedJSONSchemaFromTJS';
import consola from 'consola';
import fs from 'fs';
import { isEmpty, isError } from 'my-easy-fp';
import type { PassFailEither } from 'my-only-either';
import { fail, pass } from 'my-only-either';
import typescript from 'typescript';
import * as TJS from 'typescript-json-schema';

export default function generateJSONSchemaByTJS(
  option: ITjsOption,
  filePath: string,
  typeName: string,
): PassFailEither<Error, IGeneratedJSONSchemaFromTJS> {
  try {
    const compilerOptions = typescript.parseConfigFileTextToJson(
      option.project,
      fs.readFileSync(option.project).toString(),
    );

    const generatorOption: TJS.PartialArgs = {
      required: true,
      ignoreErrors: true,
      strictNullChecks: true,
    };

    const program = TJS.getProgramFromFiles([filePath], compilerOptions);
    const schema = TJS.generateSchema(program, typeName, generatorOption);

    if (isEmpty(schema)) {
      throw new Error(`Cannot generate JSONSchema: ${filePath}:${typeName}`);
    }

    return pass({
      generator: 'tjs',
      filePath,
      typeName,
      schema,
      formatted: '',
      banner: getBanner('tjs', option),
      reasons: [],
    });
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    const newError = new Error(`[${filePath}/${typeName}]${err.message}`);

    consola.debug(newError);

    return fail(newError);
  }
}
