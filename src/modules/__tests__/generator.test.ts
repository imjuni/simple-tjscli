import getExportedName from '@compiler/getExportedName';
import generateJSONSchemaByTJS from '@modules/generateJSONSchemaByTJS';
import generateJSONSchemaByTSJ from '@modules/generateJSONSchemaByTSJ';
import IGeneratedJSONSchemaFromTJS from '@modules/interfaces/IGeneratedJSONSchemaFromTJS';
import IGeneratedJSONSchemaFromTSJ from '@modules/interfaces/IGeneratedJSONSchemaFromTSJ';
import posixJoin from '@tools/posixJoin';
import * as env from '@tools/testenv';
import consola, { LogLevel } from 'consola';
import { IPass, isPass } from 'my-only-either';
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

test('t001-generateJSONSchemaByTSJ', async () => {
  const option = { ...env.tsjOption };
  const testFileName = 'ICollege.ts';
  const testFilePath = posixJoin(env.exampleType01Path, testFileName);
  const expectFileName = expect.getState().currentTestName.replace(/^([tT][0-9]+)(-.+)/, 'expect$2.ts');

  option.f = [testFilePath];
  option.files = [testFilePath];

  const sourceFile = share.project01.getSourceFileOrThrow(testFileName);
  const exportedDeclarationsMap = sourceFile.getExportedDeclarations();

  const names = Array.from(exportedDeclarationsMap.values())
    .filter((exportedDeclarations) => exportedDeclarations !== undefined && exportedDeclarations.length > 0)
    .map((exportedDeclarations) =>
      exportedDeclarations.map((exportedDeclaration) => getExportedName(exportedDeclaration)),
    )
    .flat();

  option.topRef = false;
  option.t = names;
  option.types = names;

  option.expose = 'none';

  const schemas = names
    .map((name) => generateJSONSchemaByTSJ(option, testFilePath, name))
    .filter((schema): schema is IPass<IGeneratedJSONSchemaFromTSJ> => isPass(schema))
    .map((schema) => schema.pass);

  const expectation = await import(path.join(__dirname, 'expects', expectFileName));

  expect(schemas).toEqual(expectation.default);
});

test('t002-generateJSONSchemaByTJS', async () => {
  const option = { ...env.tjsOption };
  const testFileName = 'ICollege.ts';
  const testFilePath = posixJoin(env.exampleType01Path, testFileName);
  const expectFileName = expect.getState().currentTestName.replace(/^([tT][0-9]+)(-.+)/, 'expect$2.ts');

  option.f = [testFilePath];
  option.files = [testFilePath];

  const sourceFile = share.project01.getSourceFileOrThrow(testFileName);
  const exportedDeclarationsMap = sourceFile.getExportedDeclarations();

  const names = Array.from(exportedDeclarationsMap.values())
    .filter((exportedDeclarations) => exportedDeclarations !== undefined && exportedDeclarations.length > 0)
    .map((exportedDeclarations) =>
      exportedDeclarations.map((exportedDeclaration) => getExportedName(exportedDeclaration)),
    )
    .flat();

  option.t = names;
  option.types = names;

  const schemas = names
    .map((name) => generateJSONSchemaByTJS(option, testFilePath, name))
    .filter((schema): schema is IPass<IGeneratedJSONSchemaFromTJS> => isPass(schema))
    .map((schema) => schema.pass);

  const expectation = await import(path.join(__dirname, 'expects', expectFileName));

  expect(schemas).toEqual(expectation.default);
});
