import { JSONSchema7 } from 'json-schema';
import * as TJS from 'typescript-json-schema';

export default interface ITemplateContents {
  banner: string;
  jsonSchemaContent: JSONSchema7 | TJS.Definition;
  variableName: string;
}
