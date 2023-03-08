import type IGeneratedJSONSchemaFromTJS from '#modules/interfaces/IGeneratedJSONSchemaFromTJS';
import type IGeneratedJSONSchemaFromTSJ from '#modules/interfaces/IGeneratedJSONSchemaFromTSJ';
import type IReason from '#modules/interfaces/IReason';
import type { JSONSchema7Definition } from 'json-schema';

interface ICommonOutputInfo {
  /** output filePath, apply sync option */
  outputFilePath: string;
  reasons: IReason[];
}

interface ITSJOutputInfo extends ICommonOutputInfo {
  definitions: Record<string, JSONSchema7Definition>;
}

interface ITJSOutputInfo extends ICommonOutputInfo {
  definitions: Record<string, IGeneratedJSONSchemaFromTJS['schema']>;
}

type TOutputJSONSchema =
  | (IGeneratedJSONSchemaFromTJS & ITJSOutputInfo)
  | (IGeneratedJSONSchemaFromTSJ & ITSJOutputInfo);

export default TOutputJSONSchema;
