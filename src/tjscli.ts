import getFileNameFromCli from '@cli/getFileNameFromCli';
import getTypeNameFromCli from '@cli/getTypeNameFromCli';
import getAllExportTypes from '@compiler/getAllExportedTypes';
import getExportedTypes from '@compiler/getExportedTypes';
import getSourceFiles from '@compiler/getSourceFiles';
import getTsProject from '@compiler/getTsProject';
import IResolvePath from '@config/interfaces/IResolvePath';
import ITjsOption from '@config/interfaces/ITjsOption';
import ITsjOption from '@config/interfaces/ITsjOption';
import aggregateDefinitions from '@modules/aggregateDefinitions';
import applyFormat from '@modules/applyFormat';
import applyPrettier from '@modules/applyPrettier';
import generateJSONSchemaByTJS from '@modules/generateJSONSchemaByTJS';
import generateJSONSchemaByTSJ from '@modules/generateJSONSchemaByTSJ';
import getDefinitions from '@modules/getDefinitions';
import getOutputDirPath from '@modules/getOutputDirPath';
import getOutputSchemaFile from '@modules/getOutputSchemaFile';
import IGeneratedJSONSchemaFromTJS from '@modules/interfaces/IGeneratedJSONSchemaFromTJS';
import IGeneratedJSONSchemaFromTSJ from '@modules/interfaces/IGeneratedJSONSchemaFromTSJ';
import TOutputJSONSchema from '@modules/interfaces/TOutputJSONSchema';
import loadTemplate from '@modules/loadTemplate';
import moveTopRef from '@modules/moveTopRef';
import writeDefinitionModule from '@modules/writeDefinitionModule';
import writeSchema from '@modules/writeSchema';
import chokidar from 'chokidar';
import colors from 'colors';
import consola, { LogLevel } from 'consola';
import fs from 'fs';
import { isEmpty, isError, isFalse, isNotEmpty } from 'my-easy-fp';
import { exists, existsSync, getDirnameSync, replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import { IPass, isFail, isPass } from 'my-only-either';
import { TraversalCallback, TraversalCallbackContext, traverse } from 'object-traversal';
import * as path from 'path';
import * as rx from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as tsm from 'ts-morph';

export async function generateJSONSchemaUsingTSJ(baseOption: ITsjOption, isMessageDisplay?: boolean) {
  const verbose = baseOption.verbose ?? false;

  if (isFalse(isMessageDisplay ?? false)) {
    consola.level = LogLevel.Error;
  } else if (verbose) {
    consola.level = LogLevel.Debug;
  } else {
    consola.level = LogLevel.Success;
  }

  const { cwd } = baseOption;

  const resolvedPath: IResolvePath = {
    resolvedCwd: replaceSepToPosix(path.resolve(cwd)),
    resolvedProjectDirPath: replaceSepToPosix(getDirnameSync(path.resolve(baseOption.project))),
    resolvedProjectFilePath: replaceSepToPosix(path.resolve(baseOption.project)),
  };

  const option = { ...baseOption, ...resolvedPath, cwd: resolvedPath.resolvedCwd };

  consola.info(`cwd: "${colors.yellow(option.resolvedCwd)}"`);

  const project = getTsProject(option);

  if (isFail(project)) {
    throw project.fail;
  }

  // If your set interactive true and type, filename is empty trigger interactive cli
  if (option.files.length <= 0 && isMessageDisplay && option.interactive) {
    const filePaths = await getFileNameFromCli(option);
    option.files = filePaths;
  }

  const sourceFiles = getSourceFiles({ project: project.pass, option });

  if (isFail(sourceFiles)) {
    throw sourceFiles.fail;
  }

  const diagnostics = project.pass.getPreEmitDiagnostics();
  const diagnosticFiles = diagnostics
    .map((diagnostic) => diagnostic.getSourceFile())
    .filter((diagnosticSourceFile): diagnosticSourceFile is tsm.SourceFile => isNotEmpty(diagnosticSourceFile))
    .map((diagnosticSourceFile) => diagnosticSourceFile.getSourceFile().getFilePath().toString())
    .reduce((filePathSet, diagnosticFilePath) => {
      filePathSet.add(diagnosticFilePath);
      return filePathSet;
    }, new Set<string>());

  if (diagnosticFiles.size > 0) {
    consola.error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
    throw new Error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
  }

  consola.info('source files: ', sourceFiles.pass.map((sourceFile) => colors.yellow(sourceFile)).join(', '));

  // If your set interactive true and type, filename is empty trigger interactive cli
  if (option.types.length <= 0 && isMessageDisplay && option.interactive) {
    const typeNames = await getTypeNameFromCli(project.pass, option);
    option.types = typeNames.map((typeName) => typeName.identifier);
  }

  const exportedTypes = getExportedTypes({ project: project.pass, sourceFiles: sourceFiles.pass, option });

  if (isFail(exportedTypes)) {
    throw exportedTypes.fail;
  }

  if (sourceFiles.pass.length <= 0 && exportedTypes.pass.length <= 0) {
    throw new Error('SourceFile, Type not founed');
  }

  consola.info(
    'exported types: ',
    exportedTypes.pass
      .map((exportedType) =>
        exportedType.exportedDeclarations.map((exportedDeclaration) => exportedDeclaration.identifier),
      )
      .flat()
      .map((typeName) => colors.yellow(typeName))
      .join(', '),
  );
  const template = loadTemplate(option);
  const outputDirPath = getOutputDirPath(option);

  if (outputDirPath !== undefined && outputDirPath !== null && isFalse(await exists(outputDirPath))) {
    await fs.promises.mkdir(outputDirPath, { recursive: true });
  }

  const jsonSchemas = exportedTypes.pass
    .map((exportedType) => {
      return exportedType.exportedDeclarations.map((exportedDeclaration) => {
        return generateJSONSchemaByTSJ(option, exportedType.sourceFilePath, exportedDeclaration.identifier);
      });
    })
    .flat();

  // const failJSONSchemas = jsonSchemas.filter((result): result is IFail<Error> => isFail(result));
  const passJSONSchemas = jsonSchemas.filter((result): result is IPass<IGeneratedJSONSchemaFromTSJ> => isPass(result));

  const outputJSONSchemas = passJSONSchemas
    .map((schema) => moveTopRef(schema.pass))
    .map((schema) => getOutputSchemaFile(schema, option));

  consola.success(`schema ${colors.yellow('generation')} successed!`);

  if (option.seperateDefinitions) {
    const traverseHandle: TraversalCallback = ({ parent, key, value }: TraversalCallbackContext): any => {
      if (parent !== undefined && parent !== null && key !== undefined && key !== null && key === '$ref') {
        // eslint-disable-next-line no-param-reassign
        parent[key] = value.replace('#/definitions/', '');
      }

      return parent;
    };

    const changeExternalDefinitionJSONSchemas = outputJSONSchemas.map((schema) => {
      traverse(schema.schema, traverseHandle);
      return schema;
    });

    const formatApplied = changeExternalDefinitionJSONSchemas.map((schema) => {
      const formatted = applyFormat(
        { banner: schema.banner, variableName: schema.typeName, jsonSchemaContent: schema.schema },
        { ...option, template },
      );
      return { ...schema, formatted };
    });

    const prettierApplied = await Promise.all(
      formatApplied.map<Promise<TOutputJSONSchema>>(async (schema) => {
        const formatted = await applyPrettier(schema.formatted, option);
        return { ...schema, formatted };
      }),
    );

    await Promise.all(prettierApplied.map((schema) => writeSchema(schema, option)));

    consola.success(`schema ${colors.yellow('write')} successed!`);

    const definitionSchemas = await aggregateDefinitions(prettierApplied, { ...option, template });
    await Promise.all(definitionSchemas.definitions.map((schema) => writeSchema(schema, option)));

    const definitionModuleFile = await getDefinitions(project.pass, option);
    await writeDefinitionModule(definitionModuleFile, option);

    consola.success(`schema ${colors.yellow('definition')} successed!`);

    return;
  }

  const formatApplied = outputJSONSchemas.map((schema) => {
    const formatted = applyFormat(
      { banner: schema.banner, variableName: schema.typeName, jsonSchemaContent: schema.schema },
      { ...option, template },
    );
    return { ...schema, formatted };
  });

  const prettierApplied = await Promise.all(
    formatApplied.map<Promise<TOutputJSONSchema>>(async (schema) => {
      const formatted = await applyPrettier(schema.formatted, option);
      return { ...schema, formatted };
    }),
  );

  await Promise.all(prettierApplied.map((schema) => writeSchema(schema, option)));

  consola.success(`schema ${colors.yellow('write')} successed!`);
}

export async function generateJSONSchemaUsingTJS(baseOption: ITjsOption, isMessageDisplay?: boolean) {
  const verbose = baseOption.verbose ?? false;

  if (isFalse(isMessageDisplay ?? false)) {
    consola.level = LogLevel.Error;
  } else if (verbose) {
    consola.level = LogLevel.Debug;
  } else {
    consola.level = LogLevel.Success;
  }

  const { cwd } = baseOption;

  const resolvedPath: IResolvePath = {
    resolvedCwd: replaceSepToPosix(path.resolve(cwd)),
    resolvedProjectDirPath: replaceSepToPosix(getDirnameSync(path.resolve(baseOption.project))),
    resolvedProjectFilePath: replaceSepToPosix(path.resolve(baseOption.project)),
  };

  const option = { ...baseOption, ...resolvedPath, cwd: resolvedPath.resolvedCwd };

  const project = getTsProject(option);

  if (isFail(project)) {
    throw project.fail;
  }

  const diagnostics = project.pass.getPreEmitDiagnostics();
  const diagnosticFiles = diagnostics
    .map((diagnostic) => diagnostic.getSourceFile())
    .filter((diagnosticSourceFile): diagnosticSourceFile is tsm.SourceFile => isNotEmpty(diagnosticSourceFile))
    .map((diagnosticSourceFile) => diagnosticSourceFile.getSourceFile().getFilePath().toString())
    .reduce((filePathSet, diagnosticFilePath) => {
      filePathSet.add(diagnosticFilePath);
      return filePathSet;
    }, new Set<string>());

  if (diagnosticFiles.size > 0) {
    consola.error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
    throw new Error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
  }

  // If your set interactive true and type, filename is empty trigger interactive cli
  if (option.files.length <= 0 && isMessageDisplay && option.interactive) {
    const filePaths = await getFileNameFromCli(option);
    option.files = filePaths;
  }

  const sourceFiles = getSourceFiles({ project: project.pass, option });

  if (isFail(sourceFiles)) {
    throw sourceFiles.fail;
  }

  // If your set interactive true and type, filename is empty trigger interactive cli
  if (option.types.length <= 0 && isMessageDisplay && option.interactive) {
    const typeNames = await getTypeNameFromCli(project.pass, option);
    option.types = typeNames.map((typeName) => typeName.identifier);
  }

  const exportedTypes = getExportedTypes({ project: project.pass, sourceFiles: sourceFiles.pass, option });

  if (isFail(exportedTypes)) {
    throw exportedTypes.fail;
  }

  const template = loadTemplate(option);
  const outputDirPath = getOutputDirPath(option);

  if (outputDirPath !== undefined && outputDirPath !== null && isFalse(await exists(outputDirPath))) {
    await fs.promises.mkdir(outputDirPath, { recursive: true });
  }

  const jsonSchemas = exportedTypes.pass
    .map((exportedType) => {
      return exportedType.exportedDeclarations.map((exportedDeclaration) => {
        return generateJSONSchemaByTJS(option, exportedType.sourceFilePath, exportedDeclaration.identifier);
      });
    })
    .flat();

  // const failJSONSchemas = jsonSchemas.filter((result): result is IFail<Error> => isFail(result));
  const passJSONSchemas = jsonSchemas.filter((result): result is IPass<IGeneratedJSONSchemaFromTJS> => isPass(result));

  const outputJSONSchemas = passJSONSchemas
    .map((schema) => schema.pass)
    .map((schema) => getOutputSchemaFile(schema, option))
    .map((schema) => {
      const formatted = applyFormat(
        { banner: schema.banner, variableName: schema.typeName, jsonSchemaContent: schema.schema },
        { ...option, template },
      );
      return { ...schema, formatted };
    });

  const prettierApplied = await Promise.all(
    outputJSONSchemas.map<Promise<TOutputJSONSchema>>(async (schema) => {
      const formatted = await applyPrettier(schema.formatted, option);
      return { ...schema, formatted };
    }),
  );

  await Promise.all(prettierApplied.map((schema) => writeSchema(schema, option)));
}

export function watchJSONSchemaUsingTSJ(baseOption: ITsjOption, isMessageDisplay?: boolean) {
  const verbose = baseOption.verbose ?? false;

  if (isFalse(isMessageDisplay ?? false)) {
    consola.level = LogLevel.Error;
  } else if (verbose) {
    consola.level = LogLevel.Debug;
  } else {
    consola.level = LogLevel.Success;
  }

  const watchDir = baseOption.watch;
  const watchDebounceTime = baseOption.debounceTime ?? 1000;

  if (isEmpty(watchDir)) {
    throw new Error(`watch command need watch directory: ${watchDir ?? ''}`);
  }

  const { cwd } = baseOption;
  const resolvedWatchDir = replaceSepToPosix(win32DriveLetterUpdown(path.resolve(path.join(baseOption.cwd, watchDir))));

  if (isFalse(existsSync(resolvedWatchDir))) {
    throw new Error(`Cannot found watch directory: ${resolvedWatchDir}`);
  }

  consola.success('Watch command start!');
  consola.info(`watching: ${colors.yellow(resolvedWatchDir)} ...`);

  const resolvedPath: IResolvePath = {
    resolvedCwd: replaceSepToPosix(path.resolve(cwd)),
    resolvedProjectDirPath: replaceSepToPosix(getDirnameSync(path.resolve(baseOption.project))),
    resolvedProjectFilePath: replaceSepToPosix(path.resolve(baseOption.project)),
  };

  const option = { ...baseOption, ...resolvedPath, cwd: resolvedPath.resolvedCwd };

  const project = getTsProject(option);

  if (isFail(project)) {
    throw project.fail;
  }

  const watcher = chokidar.watch(resolvedWatchDir, {
    ignored: [/__tests__/, /__test__/, 'node_modules', /^\..+/],
    ignoreInitial: true,
    cwd: option.cwd,
  });

  const subject = new rx.Subject<{ type: 'add' | 'change'; filePath: string }>();

  subject.pipe(debounceTime(watchDebounceTime)).subscribe((changeValue) => {
    try {
      const filePath = path.isAbsolute(changeValue.filePath)
        ? changeValue.filePath
        : replaceSepToPosix(win32DriveLetterUpdown(path.resolve(path.join(option.cwd, changeValue.filePath)), 'upper'));

      const fileExt = path.extname(filePath);

      if (fileExt !== '.ts' && fileExt !== '.mts' && fileExt !== '.cts') {
        return;
      }

      const currentProject = getTsProject(option);

      if (isFail(currentProject)) {
        consola.error(`Error initialize project: ${colors.yellow(option.project)}`);
        return;
      }

      const sourceFile = currentProject.pass.getSourceFile(path.basename(filePath));

      if (sourceFile === undefined || sourceFile === null) {
        consola.error('Cannot found typescript source file: ', filePath);
        return;
      }

      const diagnostics = sourceFile.getPreEmitDiagnostics();
      const diagnosticFiles = diagnostics
        .map((diagnostic) => diagnostic.getSourceFile())
        .filter((diagnosticSourceFile): diagnosticSourceFile is tsm.SourceFile => isNotEmpty(diagnosticSourceFile))
        .map((diagnosticSourceFile) => diagnosticSourceFile.getSourceFile().getFilePath().toString())
        .reduce((filePathSet, diagnosticFilePath) => {
          filePathSet.add(diagnosticFilePath);
          return filePathSet;
        }, new Set<string>());

      if (diagnosticFiles.size > 0) {
        consola.error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
        return;
      }

      const optionWithFiles = { ...option, f: [filePath], files: [filePath] };

      const exportTypes = getAllExportTypes({ project: project.pass, sourceFiles: [filePath] });

      const typeNames = exportTypes
        .map((exportType) =>
          exportType.exportedDeclarations.map((exportedDeclaration) => exportedDeclaration.identifier),
        )
        .flat();

      consola.debug('input files: ', changeValue.type, changeValue.filePath);
      consola.debug('input types: ', typeNames);

      const optionWithTypes = { ...optionWithFiles, types: typeNames, t: typeNames };

      generateJSONSchemaUsingTSJ(optionWithTypes, true);
    } catch (catched) {
      const err = isError(catched) ?? new Error('');
      consola.error(err);
    }
  });

  watcher
    .on('add', (filePath) => {
      consola.info(`file added: ${colors.yellow(filePath)}`);
      subject.next({ type: 'add', filePath });
    })
    .on('change', (filePath) => {
      consola.info(`file changed: ${colors.yellow(filePath)}`);
      subject.next({ type: 'change', filePath });
    });
}
