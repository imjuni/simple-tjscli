/**
 * TypeScript JSONSchema cli option
 */
export default interface ICommonOption {
  /** current working directory */
  w: string;
  cwd: string;

  /** configuration file */
  c: string;
  config: string;

  /** tsconfig path */
  p: string;
  project: string;

  /** input filename */
  f: string[];
  files: string[];

  /** type name in input filename */
  t: string[];
  types: string[];

  /** Run Sync Mode, directory structure sync with input file */
  s: boolean;
  sync: boolean;

  /** trigger interactive cli */
  i: boolean;
  interactive: boolean;

  /** no banner in generated schema */
  b: boolean;
  noBanner: boolean;

  /** output type */
  u: 'json' | 'ts';
  outputType: 'json' | 'ts';

  /** if outputType set true that option using output file extname */
  e: string;
  extName: string;

  /** output file directory */
  o?: string;
  output?: string;

  /** filename prefix in JSONSchema, default value is JSC_ */
  x?: string;
  prefix?: string;

  /** overwrite previous schema */
  overwrite: boolean;

  /** TypeScript code Template */
  template?: string;

  /** TypeScript code Template Path */
  templatePath?: string;

  /** watch directory */
  watch?: string;
  /** watching debounce time */
  debounceTime?: number;

  /** verbose message */
  v: boolean;
  verbose: boolean;
}
