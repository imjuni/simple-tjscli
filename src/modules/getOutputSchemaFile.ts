import ITjsOption from '@config/interfaces/ITjsOption';
import ITsjOption from '@config/interfaces/ITsjOption';
import getOutputDirPath from '@modules/getOutputDirPath';
import getOutputFileName from '@modules/getOutputFileName';
import IReason from '@modules/interfaces/IReason';
import TGeneratedJSONSchema from '@modules/interfaces/TGenerateJSONSchema';
import TOutputJSONSchema from '@modules/interfaces/TOutputJSONSchema';
import { JSONSchema7 } from 'json-schema';
import { existsSync } from 'my-node-fp';

export default function getOutputSchemaFile(
  generatedSchema: TGeneratedJSONSchema,
  option: ITjsOption | ITsjOption,
): TOutputJSONSchema {
  const outputDirPath = getOutputDirPath(option);

  if (option.sync && outputDirPath !== undefined && outputDirPath !== null && existsSync(outputDirPath)) {
    const outputFilePath = getOutputFileName(generatedSchema, { ...option, output: outputDirPath });

    if (generatedSchema.generator === 'tsj' && option.generator === 'tsj' && option.seperateDefinitions) {
      const definitions = { ...(generatedSchema.schema.definitions ?? {}) };
      const schema: JSONSchema7 = { ...generatedSchema.schema, definitions: undefined };
      return { outputFilePath, definitions, ...generatedSchema, schema, reasons: [] };
    }

    return { outputFilePath, definitions: {}, ...generatedSchema, reasons: [] };
  }

  if (option.sync && (option.output === undefined || option.output === null)) {
    const reason: IReason = {
      type: 'warn',
      message: 'Sync option need output directory configuration!',
      filePath: option.project,
    };

    const outputFilePath = getOutputFileName(generatedSchema, option);
    return { outputFilePath, definitions: {}, ...generatedSchema, reasons: [reason] };
  }

  const outputFilePath = getOutputFileName(generatedSchema, option);
  return { outputFilePath, definitions: {}, ...generatedSchema, reasons: [] };
}
