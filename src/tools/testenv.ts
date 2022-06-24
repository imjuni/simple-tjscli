import ITjsOption from '@config/interfaces/ITjsOption';
import ITsjOption from '@config/interfaces/ITsjOption';
import posixJoin from './posixJoin';

export const examplePath = posixJoin(__dirname, '..', '..', 'example');
export const exampleType01Path = posixJoin(examplePath, 'type01');
export const exampleOutputPath = posixJoin(examplePath, 'output');

export const tsjOption: ITsjOption = {
  w: exampleType01Path,
  cwd: exampleType01Path,
  c: '',
  config: '',
  p: posixJoin(exampleType01Path, 'tsconfig.json'),
  project: posixJoin(exampleType01Path, 'tsconfig.json'),
  f: [],
  files: [],
  t: [],
  types: [],
  u: 'json',
  outputType: 'json',
  v: false,
  verbose: false,
  s: false,
  sync: false,
  i: false,
  interactive: false,
  b: false,
  noBanner: false,
  e: '.ts',
  extName: '.ts',
  overwrite: false,

  generator: 'tsj',
  skipTypeCheck: true,
  topRef: true,
  expose: 'export',
  jsDoc: 'extended',
  extraTags: [],
  additionalProperties: true,
};

export const tjsOption: ITjsOption = {
  w: exampleType01Path,
  cwd: exampleType01Path,
  c: '',
  config: '',
  p: posixJoin(exampleType01Path, 'tsconfig.json'),
  project: posixJoin(exampleType01Path, 'tsconfig.json'),
  f: [],
  files: [],
  t: [],
  types: [],
  u: 'json',
  outputType: 'json',
  v: false,
  verbose: false,
  s: false,
  sync: false,
  i: false,
  interactive: false,
  b: false,
  noBanner: false,
  e: '.ts',
  extName: '.ts',
  overwrite: false,

  generator: 'tjs',
};
