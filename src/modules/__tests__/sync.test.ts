import getExportedName from '@compiler/getExportedName';
import generateJSONSchemaByTSJ from '@modules/generateJSONSchemaByTSJ';
import getOutputSchemaFile from '@modules/getOutputSchemaFile';
import IGeneratedJSONSchemaFromTSJ from '@modules/interfaces/IGeneratedJSONSchemaFromTSJ';
import moveTopRef from '@modules/moveTopRef';
import posixJoin from '@tools/posixJoin';
import * as env from '@tools/testenv';
import consola, { LogLevel } from 'consola';
import fs from 'fs';
import { isFalse } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import { IPass, isPass } from 'my-only-either';
import path from 'path';
import * as tsm from 'ts-morph';

const share: {
  projectPath01: string;
  project01: tsm.Project;
} = {} as any;

beforeAll(async () => {
  consola.level = LogLevel.Debug;

  share.projectPath01 = posixJoin(env.exampleType01Path, 'tsconfig.json');
  share.project01 = new tsm.Project({ tsConfigFilePath: share.projectPath01 });

  if (isFalse(await exists(env.exampleOutputPath))) {
    await fs.promises.mkdir(env.exampleOutputPath, { recursive: true });
  }
});

test('t001-getOutputSchemaFile-case01', async () => {
  const option = { ...env.tsjOption };
  const expectFileName = expect.getState().currentTestName?.replace(/^([tT][0-9]+)(-.+)/, 'expect$2.ts') ?? '';

  option.f = [posixJoin(env.exampleType01Path, 'ICollege.ts'), posixJoin(env.exampleType01Path, 'sub', 'IStudent.ts')];
  option.files = [...option.f];

  const collegeSourceFile = share.project01.getSourceFileOrThrow('ICollege.ts');
  const collegeExportedDeclarationsMap = collegeSourceFile.getExportedDeclarations();

  const studentSourceFile = share.project01.getSourceFileOrThrow('IStudent.ts');
  const studentExportedDeclarationsMap = studentSourceFile.getExportedDeclarations();

  const names = [
    ...Array.from(collegeExportedDeclarationsMap.values())
      .filter((exportedDeclarations) => exportedDeclarations !== undefined && exportedDeclarations.length > 0)
      .map((exportedDeclarations) =>
        exportedDeclarations.map((exportedDeclaration) => getExportedName(exportedDeclaration)),
      )
      .flat()
      .map((name) => {
        return { filePath: posixJoin(env.exampleType01Path, 'ICollege.ts'), name };
      }),

    ...Array.from(studentExportedDeclarationsMap.values())
      .filter((exportedDeclarations) => exportedDeclarations !== undefined && exportedDeclarations.length > 0)
      .map((exportedDeclarations) =>
        exportedDeclarations.map((exportedDeclaration) => getExportedName(exportedDeclaration)),
      )
      .flat()
      .map((name) => {
        return { filePath: posixJoin(env.exampleType01Path, 'sub', 'IStudent.ts'), name };
      }),
  ];

  option.topRef = false;
  option.expose = 'all';

  option.t = names.map((name) => name.name);
  option.types = [...option.t];

  option.sync = true;
  option.seperateDefinitions = true;
  option.output = env.exampleOutputPath;

  const schemas = names
    .map((name) => generateJSONSchemaByTSJ(option, name.filePath, name.name))
    .filter((schema): schema is IPass<IGeneratedJSONSchemaFromTSJ> => isPass(schema))
    .map((schema) => schema.pass);

  const output = schemas.map((schema) => getOutputSchemaFile(schema, option));
  const sortedOutput = output.sort((left, right) => left.filePath.localeCompare(right.filePath));

  const expectation = await import(path.join(__dirname, 'expects', expectFileName));
  const sortedExpectation = expectation.default.sort((left: any, right: any) =>
    left.filePath.localeCompare(right.filePath),
  );

  expect(sortedOutput).toEqual(sortedExpectation);
});

test('t002-moveTopRef-case01', async () => {
  const option = { ...env.tsjOption };
  const expectFileName = expect.getState().currentTestName?.replace(/^([tT][0-9]+)(-.+)/, 'expect$2.ts') ?? '';

  option.f = [posixJoin(env.exampleType01Path, 'sub', 'TStudentResp.ts')];
  option.files = [...option.f];

  const studentSourceFile = share.project01.getSourceFileOrThrow('TStudentResp.ts');
  const studentExportedDeclarationsMap = studentSourceFile.getExportedDeclarations();

  const names = [
    ...Array.from(studentExportedDeclarationsMap.values())
      .filter((exportedDeclarations) => exportedDeclarations !== undefined && exportedDeclarations.length > 0)
      .map((exportedDeclarations) =>
        exportedDeclarations.map((exportedDeclaration) => getExportedName(exportedDeclaration)),
      )
      .flat()
      .map((name) => {
        return { filePath: posixJoin(env.exampleType01Path, 'sub', 'TStudentResp.ts'), name };
      }),
  ];

  option.topRef = false;
  option.expose = 'all';

  option.t = names.map((name) => name.name);
  option.types = [...option.t];

  option.sync = true;
  option.seperateDefinitions = true;
  option.output = env.exampleOutputPath;

  const schemas = names
    .map((name) => generateJSONSchemaByTSJ(option, name.filePath, name.name))
    .filter((schema): schema is IPass<IGeneratedJSONSchemaFromTSJ> => isPass(schema))
    .map((schema) => schema.pass);

  const output = schemas.map((schema) => moveTopRef(schema));
  const sortedOutput = output.sort((left, right) => left.filePath.localeCompare(right.filePath));

  const expectation = await import(path.join(__dirname, 'expects', expectFileName));
  const sortedExpectation = expectation.default.sort((left: any, right: any) =>
    left.filePath.localeCompare(right.filePath),
  );

  expect(sortedOutput).toEqual(sortedExpectation);
});
