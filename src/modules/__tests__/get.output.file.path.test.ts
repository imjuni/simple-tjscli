import getExportedName from '@compiler/getExportedName';
import generateJSONSchemaByTSJ from '@modules/generateJSONSchemaByTSJ';
import getOutputFilePath from '@modules/getOutputFileName';
import IGeneratedJSONSchemaFromTSJ from '@modules/interfaces/IGeneratedJSONSchemaFromTSJ';
import posixJoin from '@tools/posixJoin';
import * as env from '@tools/testenv';
import consola, { LogLevel } from 'consola';
import { IPass, isPass } from 'my-only-either';
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

test('t001-getOutputFilePath', async () => {
  const option = { ...env.tsjOption };
  const testFileName = 'ICollege.ts';
  const testFilePath = posixJoin(env.exampleType01Path, testFileName);

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

  const [schema] = schemas;

  const filePath = getOutputFilePath(schema, option);

  expect(filePath).toEqual(posixJoin(env.exampleType01Path, 'ICollege.json'));
});

test('t002-getOutputFilePath', async () => {
  const option = { ...env.tsjOption };
  const testFileName = 'ICollege.ts';
  const testFilePath = posixJoin(env.exampleType01Path, testFileName);

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

  const [schema] = schemas;

  option.u = 'ts';
  option.outputType = 'ts';

  const filePath = getOutputFilePath(schema, option);

  expect(filePath).toEqual(posixJoin(env.exampleType01Path, 'ICollege.ts'));
});

test('t003-getOutputFilePath', async () => {
  const option = { ...env.tsjOption };
  const testFileName = 'IStudent.ts';
  const testFilePath = posixJoin(env.exampleType01Path, 'sub', testFileName);

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
  option.output = env.exampleOutputPath;

  const schemas = names
    .map((name) => generateJSONSchemaByTSJ(option, testFilePath, name))
    .filter((schema): schema is IPass<IGeneratedJSONSchemaFromTSJ> => isPass(schema))
    .map((schema) => schema.pass);

  const [schema] = schemas;

  const filePath = getOutputFilePath(schema, option);

  expect(filePath).toEqual(posixJoin(env.exampleOutputPath, 'sub', 'IStudent.json'));
});

test('t004-getOutputFilePath', async () => {
  const option = { ...env.tsjOption };
  const testFileName = 'IStudent.ts';
  const testFilePath = posixJoin(env.exampleType01Path, 'sub', testFileName);

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
  option.output = env.exampleOutputPath;
  option.outputType = 'ts';

  const schemas = names
    .map((name) => generateJSONSchemaByTSJ(option, testFilePath, name))
    .filter((schema): schema is IPass<IGeneratedJSONSchemaFromTSJ> => isPass(schema))
    .map((schema) => schema.pass);

  const [schema] = schemas;

  const filePath = getOutputFilePath(schema, option);

  expect(filePath).toEqual(posixJoin(env.exampleOutputPath, 'sub', 'IStudent.ts'));
});
