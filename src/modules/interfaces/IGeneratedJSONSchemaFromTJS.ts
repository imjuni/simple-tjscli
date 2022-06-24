import IReason from '@modules/interfaces/IReason';
import * as TJS from 'typescript-json-schema';

export default interface IGeneratedJSONSchemaFromTJS {
  generator: 'tjs';
  banner: string;
  filePath: string;
  formatted: string;
  reasons: IReason[];
  schema: TJS.Definition;
  typeName: string;
}
