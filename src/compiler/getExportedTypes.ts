import ICommonOption from '@config/interfaces/ICommonOption';
import { isError } from 'my-easy-fp';
import { pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';
import getAllExportTypes from './getAllExportedTypes';

/**
 * getExportTypes function params
 */
interface IGetExportTypesParams {
  project: tsm.Project;
  sourceFiles: string[];
  option: ICommonOption;
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
export default function getExportTypes({
  project,
  sourceFiles,
  option,
}: IGetExportTypesParams): PassFailEither<Error, IGetExportTypesReturn[]> {
  try {
    const exportTypes = getAllExportTypes({ project, sourceFiles });

    const filteredExportTypes = exportTypes
      .map((exportType) => {
        const exportedDeclarations = exportType.exportedDeclarations.filter((exportedDeclarationsType) =>
          option.types.includes(exportedDeclarationsType.identifier),
        );

        return { ...exportType, exportedDeclarations };
      })
      .filter((exportType) => {
        return exportType.exportedDeclarations.length > 0;
      });

    return pass(filteredExportTypes);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    return fail(err);
  }
}
