/**
 * TypeScript JSONSchema cli option
 */
export interface ITjsCliOption {
  /**
   * engine
   *
   * * tjs TypeScript JSONSchema: https://github.com/YousefED/typescript-json-schema
   * * tsj TypeScript JSONSchema generator: https://github.com/vega/ts-json-schema-generator
   */
  engine: 'tjs' | 'tsj';

  /** current working directory */
  cwd: string;

  /** tsconfig path */
  project: string;

  /** input filename */
  files: string[];

  /** type name in input filename */
  types: string[];

  /** output type */
  outputType: 'json' | 'ts';

  /** output file directory */
  output?: string;

  /** filename prefix in JSONSchema, default value is JSC_ */
  prefix?: string;

  /** TypeScript format */
  formatPath?: string;

  /** TSJ generator option */
  topRef?: boolean;

  /** TSJ generator option */
  expose?: 'all' | 'none' | 'export';

  /** TSJ generator option */
  jsDoc?: 'none' | 'extended' | 'basic';

  /** TSJ generator option */
  extraTags?: string[];
}
