import getExportedName from '@compiler/getExportedName';
import getFirstExportedDeclaration from '@compiler/getFirstExportedDeclaration';
import consola from 'consola';
import { isError } from 'my-easy-fp';
import { replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import * as tsm from 'ts-morph';

/**
 * getExportTypes function params
 */
interface IGetAllExportTypesParams {
  project: tsm.Project;
  sourceFiles: string[];
}

interface IGetExportTypesReturn {
  sourceFile: tsm.SourceFile;
  sourceFilePath: string;
  exportedDeclarations: Array<{
    identifier: string;
    exportedDeclarations: tsm.ExportedDeclarations;
  }>;
}

/**
 *
 * @param param0.project ts-morph Porject object
 * @param param0.sourceFiles user passed filePath, filePath is absolute path or relative path base on cwd
 * @param param0.option option object
 */
export default function getAllExportTypes({ project, sourceFiles }: IGetAllExportTypesParams): IGetExportTypesReturn[] {
  try {
    const filePaths = sourceFiles.map((sourceFile) => replaceSepToPosix(win32DriveLetterUpdown(sourceFile, 'upper')));

    const sourceFilesWithExported = project
      .getSourceFiles()
      .filter((sourceFile) => {
        const filePath = sourceFile.getFilePath().toString();
        return filePaths.includes(filePath);
      })
      .map((sourceFile) => {
        const exportedDeclarationsMap = sourceFile.getExportedDeclarations();

        const exportedDeclarationsTypes = Array.from(exportedDeclarationsMap.values()).map((exportedDeclarations) => {
          const firstExportedDeclaration = getFirstExportedDeclaration(exportedDeclarations);

          return {
            filePath: sourceFile.getFilePath().toString(),
            identifier: getExportedName(firstExportedDeclaration),
            exportedDeclarations: firstExportedDeclaration,
          };
        });

        return {
          sourceFile,
          sourceFilePath: sourceFile.getFilePath().toString(),
          exportedDeclarations: exportedDeclarationsTypes,
        };
      });

    return sourceFilesWithExported;
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    consola.debug(err);

    return [];
  }
}
