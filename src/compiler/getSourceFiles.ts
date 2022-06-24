import ICommonOption from '@config/interfaces/ICommonOption';
import IResolvePath from '@config/interfaces/IResolvePath';
import getFilePath from '@modules/getFilePath';
import { isEmpty, isError } from 'my-easy-fp';
import { fail, pass, PassFailEither } from 'my-only-either';
import * as tsm from 'ts-morph';

// const globPaths = ['**/*.ts', '!node_modules', '!dist/**', '!artifact/**', '!**/*.d.ts', '!**/__test__'];

interface ISourceFileLoaderParams {
  project: tsm.Project;
  option: ICommonOption & IResolvePath;
}

export default function getSourceFiles({ option, project }: ISourceFileLoaderParams): PassFailEither<Error, string[]> {
  try {
    const filePaths = option.files.map((sourceFile) => getFilePath(sourceFile, option));
    const sourceFiles = project.getSourceFiles().map((sourceFile) => sourceFile.getFilePath().toString());

    const filteredTargetFiles = filePaths
      .filter((targetFile) => (isEmpty(option.prefix) ? true : targetFile.startsWith(option.prefix)))
      .filter((targetFile) => sourceFiles.includes(targetFile));

    return pass(filteredTargetFiles);
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    return fail(err);
  }
}
