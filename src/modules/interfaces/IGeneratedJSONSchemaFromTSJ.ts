import IReason from '@modules/interfaces/IReason';
import { JSONSchema7 } from 'json-schema';

export default interface IGeneratedJSONSchemaFromTSJ {
  generator: 'tsj';
  banner: string;
  filePath: string;
  formatted: string;
  reasons: IReason[];
  schema: JSONSchema7;
  typeName: string;
}
