import type IGeneratedJSONSchemaFromTSJ from '#modules/interfaces/IGeneratedJSONSchemaFromTSJ';
import type IReason from '#modules/interfaces/IReason';
import type { JSONSchema7 } from 'json-schema';

export default function moveTopRef(generatedSchema: IGeneratedJSONSchemaFromTSJ): IGeneratedJSONSchemaFromTSJ {
  const { schema } = generatedSchema;
  const ref = schema.$ref;

  if (
    ref !== undefined &&
    ref !== null &&
    (schema.properties === undefined || schema.properties === null) &&
    (schema.type === undefined || schema.type === null)
  ) {
    const refName = decodeURIComponent(ref.replace('#/definitions/', ''));
    const topRef = schema.definitions?.[refName];

    if (topRef === undefined || topRef === null || typeof topRef === 'boolean') {
      const reason: IReason = {
        type: 'error',
        filePath: generatedSchema.filePath,
        message: `JSONSchema properties is empty, but cannot found ${refName} in schema.definitions`,
      };

      return { ...generatedSchema, reasons: [...generatedSchema.reasons, reason] };
    }

    const nextSchema: JSONSchema7 = { ...schema, definitions: { ...schema.definitions }, ...topRef };
    delete nextSchema.$ref;

    if (nextSchema.definitions?.[refName] !== undefined && nextSchema.definitions?.[refName] !== null) {
      delete nextSchema.definitions[refName];
    }

    return { ...generatedSchema, schema: nextSchema };
  }

  return generatedSchema;
}
