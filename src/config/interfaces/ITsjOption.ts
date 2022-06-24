import type ICommonOption from '@config/interfaces/ICommonOption';

/**
 * TypeScript ts-json-schema-generator JSONSchema option
 */
export default interface ITsjOption extends ICommonOption {
  /**
   * engine
   *
   * * tsj TypeScript JSONSchema generator: https://github.com/vega/ts-json-schema-generator
   */
  generator: 'tsj';

  /**
   * JSONSchema.definitions aggregate on seperate file: definitions.ts. this option need output directory option
   *
   * seperateDefinitions need some option
   * > topRef: false, expose: 'export' or 'all' and seperateDefinitions: true
   * */
  seperateDefinitions?: boolean;

  /** TSJ generator option: skip type check for better performance */
  skipTypeCheck?: boolean;

  /** TSJ generator option */
  topRef?: boolean;

  /** TSJ generator option */
  expose?: 'all' | 'none' | 'export';

  /** TSJ generator option */
  jsDoc?: 'none' | 'extended' | 'basic';

  /** TSJ generator option */
  extraTags?: string[];

  /** TSJ generator option */
  additionalProperties: boolean;
}
