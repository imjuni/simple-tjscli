import ITsjOption from '@config/interfaces/ITsjOption';
import getBanner from '@modules/getBanner';
import IGeneratedJSONSchemaFromTSJ from '@modules/interfaces/IGeneratedJSONSchemaFromTSJ';
import consola from 'consola';
import { JSONSchema7 } from 'json-schema';
import { isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as TSJ from 'ts-json-schema-generator';

export default function generateJSONSchemaByTSJ(
  option: ITsjOption,
  filePath: string,
  typeName: string,
): PassFailEither<Error, IGeneratedJSONSchemaFromTSJ> {
  try {
    const generatorOption: TSJ.Config = {
      path: filePath,
      tsconfig: option.project,
      // name of type, ICollege
      type: typeName,
      expose: option.expose ?? 'export',
      jsDoc: option.jsDoc ?? 'extended',
      topRef: option.topRef ?? false,
      skipTypeCheck: option.skipTypeCheck ?? false,
      extraTags: option.extraTags ?? [],
      additionalProperties: option.additionalProperties ?? false,
    };

    const generator = TSJ.createGenerator(generatorOption);

    const schema: JSONSchema7 = generator.createSchema(typeName);

    return pass({
      generator: 'tsj',
      filePath,
      typeName,
      schema,
      formatted: '',
      banner: getBanner('tsj', option),
      reasons: [],
    });
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    const newError = new Error(`[${filePath}/${typeName}]${err.message}`);

    consola.debug(newError);

    return fail(newError);
  }
}
