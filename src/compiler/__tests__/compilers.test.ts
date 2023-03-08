import getExportedName from '#compiler/getExportedName';
import getExportTypes from '#compiler/getExportedTypes';
import getTestValue from '#tools/getTestValue';
import posixJoin from '#tools/posixJoin';
import * as env from '#tools/testenv';
import consola, { LogLevel } from 'consola';
import { isFail } from 'my-only-either';
import path from 'path';
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

test('t001-getExportedName', async () => {
  const sourceFile = share.project01.getSourceFileOrThrow('ICollege.ts');

  const exportedDeclarations = sourceFile.getExportedDeclarations();
  const icollege = exportedDeclarations.get('ICollege');

  if (icollege === undefined || icollege.length <= 0) {
    throw new Error('invalid exportedDeclarations');
  }

  const name = getExportedName(icollege[0]);

  consola.debug(name);

  expect(name).toEqual('ICollege');
});

test('t002-getExportTypes', async () => {
  const types = ['ICollege'];
  const option = { ...env.tsjOption, t: types, types };
  const testFileName = posixJoin(env.exampleType01Path, 'ICollege.ts');
  const expectFileName = expect.getState().currentTestName?.replace(/^([tT][0-9]+)(-.+)/, 'expect$2.ts') ?? '';

  const result = getExportTypes({ project: share.project01, sourceFiles: [testFileName], option });

  if (isFail(result)) {
    throw result.fail;
  }

  const terminatedResult = getTestValue(result.pass);

  const expectation = await import(path.join(__dirname, 'expects', expectFileName));

  expect(terminatedResult).toEqual(expectation.default);
});
