import getFileNameFromCli from '#cli/getFileNameFromCli';
import getTypeNameFromCli from '#cli/getTypeNameFromCli';
import getAllExportTypes from '#compiler/getAllExportedTypes';
import getExportedTypes from '#compiler/getExportedTypes';
import getSourceFiles from '#compiler/getSourceFiles';
import getTsProject from '#compiler/getTsProject';
import type IResolvePath from '#config/interfaces/IResolvePath';
import type ITjsOption from '#config/interfaces/ITjsOption';
import type ITsjOption from '#config/interfaces/ITsjOption';
import aggregateDefinitions from '#modules/aggregateDefinitions';
import applyFormat from '#modules/applyFormat';
import applyPrettier from '#modules/applyPrettier';
import generateJSONSchemaByTJS from '#modules/generateJSONSchemaByTJS';
import generateJSONSchemaByTSJ from '#modules/generateJSONSchemaByTSJ';
import getDefinitions from '#modules/getDefinitions';
import getOutputDirPath from '#modules/getOutputDirPath';
import getOutputSchemaFile from '#modules/getOutputSchemaFile';
import type IGeneratedJSONSchemaFromTJS from '#modules/interfaces/IGeneratedJSONSchemaFromTJS';
import type IGeneratedJSONSchemaFromTSJ from '#modules/interfaces/IGeneratedJSONSchemaFromTSJ';
import type TOutputJSONSchema from '#modules/interfaces/TOutputJSONSchema';
import loadTemplate from '#modules/loadTemplate';
import moveTopRef from '#modules/moveTopRef';
import writeDefinitionModule from '#modules/writeDefinitionModule';
import writeSchema from '#modules/writeSchema';
import logger from '#tools/logger';
import chokidar from 'chokidar';
import colors from 'colors';
import fs from 'fs';
import { isEmpty, isError, isFalse, isNotEmpty } from 'my-easy-fp';
import { exists, existsSync, getDirnameSync, replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import type { IPass } from 'my-only-either';
import { isFail, isPass } from 'my-only-either';
import type { TraversalCallback, TraversalCallbackContext } from 'object-traversal';
import { traverse } from 'object-traversal';
import * as path from 'path';
import * as rx from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import type * as tsm from 'ts-morph';

const log = logger();

export async function generateJSONSchemaUsingTSJ(baseOption: ITsjOption, isMessageDisplay?: boolean) {
  const verbose = baseOption.verbose ?? false;

  if ((isMessageDisplay ?? false) === false) {
    log.level = 'error';
  } else if (verbose) {
    log.level = 'verbose';
  } else {
    log.level = 'info';
  }

  const { cwd } = baseOption;

  const resolvedPath: IResolvePath = {
    resolvedCwd: replaceSepToPosix(path.resolve(cwd)),
    resolvedProjectDirPath: replaceSepToPosix(getDirnameSync(path.resolve(baseOption.project))),
    resolvedProjectFilePath: replaceSepToPosix(path.resolve(baseOption.project)),
  };

  const option = { ...baseOption, ...resolvedPath, cwd: resolvedPath.resolvedCwd };

  log.info(`cwd: "${colors.yellow(option.resolvedCwd)}"`);

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

  if (isFalse(option.skipError)) {
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
      log.error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
      throw new Error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
    }
  }

  log.info('source files: ', sourceFiles.pass.map((sourceFile) => colors.yellow(sourceFile)).join(', '));

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

  log.info(
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

  log.info(`schema ${colors.yellow('generation')} successed!`);

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

    prettierApplied.map((schema) => log.info(`schema ${colors.yellow(`${schema.outputFilePath}`)} write successed!`));

    log.info(`schema ${colors.yellow('write')} successed!`);

    const definitionSchemas = await aggregateDefinitions(prettierApplied, { ...option, template });
    await Promise.all(definitionSchemas.definitions.map((schema) => writeSchema(schema, option)));

    const definitionModuleFile = await getDefinitions(project.pass, option);
    await writeDefinitionModule(definitionModuleFile, option);

    log.info(`schema ${colors.yellow('definition')} successed!`);

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

  log.info(`schema ${colors.yellow('write')} successed!`);
}

export async function generateJSONSchemaUsingTJS(baseOption: ITjsOption, isMessageDisplay?: boolean) {
  const verbose = baseOption.verbose ?? false;

  if ((isMessageDisplay ?? false) === false) {
    log.level = 'error';
  } else if (verbose) {
    log.level = 'verbose';
  } else {
    log.level = 'info';
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

  if (isFalse(option.skipError)) {
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
      log.error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
      throw new Error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
    }
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

  prettierApplied.map((schema) => log.info(`schema ${colors.yellow(`${schema.outputFilePath}`)} write successed!`));
}

export function watchJSONSchemaUsingTSJ(baseOption: ITsjOption, isMessageDisplay?: boolean) {
  const verbose = baseOption.verbose ?? false;

  if ((isMessageDisplay ?? false) === false) {
    log.level = 'error';
  } else if (verbose) {
    log.level = 'verbose';
  } else {
    log.level = 'info';
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

  log.info('Watch command start!');
  log.info(`watching: ${colors.yellow(resolvedWatchDir)} ...`);

  const resolvedPath: IResolvePath = {
    resolvedCwd: replaceSepToPosix(path.resolve(cwd)),
    resolvedProjectDirPath: replaceSepToPosix(getDirnameSync(path.resolve(baseOption.project))),
    resolvedProjectFilePath: replaceSepToPosix(path.resolve(baseOption.project)),
  };

  const option = { ...baseOption, ...resolvedPath, cwd: resolvedPath.resolvedCwd, watch: resolvedWatchDir };

  const project = getTsProject(option);

  if (isFail(project)) {
    throw project.fail;
  }

  const watcher = chokidar.watch(resolvedWatchDir, {
    ignored: [/__tests__/, /__test__/, 'node_modules', /^\..+/],
    ignoreInitial: true,
    cwd: resolvedPath.resolvedCwd,
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
        log.error(`Error initialize project: ${colors.yellow(option.project)}`);
        return;
      }

      const sourceFile = currentProject.pass.getSourceFile(path.basename(filePath));

      if (sourceFile === undefined || sourceFile === null) {
        log.error('Cannot found typescript source file: ', filePath);
        return;
      }

      if (isFalse(option.skipError)) {
        const diagnostics = currentProject.pass.getPreEmitDiagnostics();
        const diagnosticFiles = diagnostics
          .map((diagnostic) => diagnostic.getSourceFile())
          .filter((diagnosticSourceFile): diagnosticSourceFile is tsm.SourceFile => isNotEmpty(diagnosticSourceFile))
          .map((diagnosticSourceFile) => diagnosticSourceFile.getSourceFile().getFilePath().toString())
          .reduce((filePathSet, diagnosticFilePath) => {
            filePathSet.add(diagnosticFilePath);
            return filePathSet;
          }, new Set<string>());

        if (diagnosticFiles.size > 0) {
          log.error(`Compile error from: ${Array.from(diagnosticFiles).join(', ')}`);
          return;
        }
      }

      const optionWithFiles = { ...option, f: [filePath], files: [filePath] };

      const exportTypes = getAllExportTypes({ project: project.pass, sourceFiles: [filePath] });

      const typeNames = exportTypes
        .map((exportType) =>
          exportType.exportedDeclarations.map((exportedDeclaration) => exportedDeclaration.identifier),
        )
        .flat();

      log.debug('input files: ', changeValue.type, changeValue.filePath);
      log.debug('input types: ', typeNames);

      const optionWithTypes = { ...optionWithFiles, types: typeNames, t: typeNames };

      generateJSONSchemaUsingTSJ(optionWithTypes, true);
    } catch (catched) {
      const err = isError(catched) ?? new Error('');
      log.error(err);
    }
  });

  watcher
    .on('add', (filePath) => {
      log.info(`file added: ${colors.yellow(filePath)}`);
      subject.next({ type: 'add', filePath });
    })
    .on('change', (filePath) => {
      log.info(`file changed: ${colors.yellow(filePath)}`);
      subject.next({ type: 'change', filePath });
    });
}
