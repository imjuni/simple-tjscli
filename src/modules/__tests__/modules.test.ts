import getOutputDirPath from '#modules/getOutputDirPath';
import posixJoin from '#tools/posixJoin';
import * as env from '#tools/testenv';
import consola, { LogLevel } from 'consola';
import { replaceSepToPosix } from 'my-node-fp';
import * as tsm from 'ts-morph';

const share: {
  projectPath01: string;
  project01: tsm.Project;
} = {} as any;

beforeAll(() => {
  consola.level = LogLevel.Debug;

  share.projectPath01 = posixJoin(env.exampleType01Path, 'tsconfig.json');
  share.project01 = new tsm.Project({ tsConfigFilePath: share.projectPath01 });
});

test('t001-getOutputDirPath-case01', async () => {
  const option = { ...env.tsjOption };

  option.f = [posixJoin(env.exampleType01Path, 'ICollege.ts'), posixJoin(env.exampleType01Path, 'sub', 'IStudent.ts')];
  option.files = [...option.f];

  option.topRef = false;
  option.expose = 'all';

  option.sync = true;
  option.seperateDefinitions = true;
  option.output = env.exampleOutputPath;

  const outputDirPath = getOutputDirPath(option);

  consola.debug(outputDirPath);

  expect(outputDirPath).toEqual(posixJoin(env.examplePath, 'output'));
});

test('t002-getOutputDirPath-case02', async () => {
  const option = { ...env.tsjOption };

  option.f = [posixJoin(env.exampleType01Path, 'ICollege.ts'), posixJoin(env.exampleType01Path, 'sub', 'IStudent.ts')];
  option.files = [...option.f];

  option.topRef = false;
  option.expose = 'all';

  option.w = replaceSepToPosix(env.exampleType01Path);
  option.cwd = option.w;
  option.sync = true;
  option.seperateDefinitions = true;
  option.output = '../output';

  const outputDirPath = getOutputDirPath(option);

  consola.debug(outputDirPath);

  expect(outputDirPath).toEqual(posixJoin(env.examplePath, 'output'));
});
