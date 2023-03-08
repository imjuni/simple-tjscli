import type IReason from '#modules/interfaces/IReason';
import type { JSONSchema7 } from 'json-schema';

export default interface IGeneratedJSONSchemaFromTSJ {
  generator: 'tsj';
  banner: string;
  filePath: string;
  formatted: string;
  reasons: IReason[];
  schema: JSONSchema7;
  typeName: string;
}
