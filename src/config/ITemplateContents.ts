import type { JSONSchema7 } from 'json-schema';
import type * as TJS from 'typescript-json-schema';

export default interface ITemplateContents {
  banner: string;
  jsonSchemaContent: JSONSchema7 | TJS.Definition;
  variableName: string;
}
