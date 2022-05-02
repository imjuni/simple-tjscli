import { IPromptAnswerSelectFile } from '@interfaces/IPrompt';
import consola from 'consola';
import fastGlob from 'fast-glob';
import * as TEI from 'fp-ts/Either';
import fuzzy from 'fuzzy';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { isFalse, isTrue } from 'my-easy-fp';
import { exists, replaceSepToPosix } from 'my-node-fp';
import * as path from 'path';

const globPaths = ['**/*.ts', '!node_modules', '!dist/**', '!artifact/**', '!**/*.d.ts', '!**/__test__'];

interface ISourceFileLoaderParams {
  cwd: string;
  files: string[];
  prefix?: string;
}

async function fileLoad({ cwd, files, prefix }: ISourceFileLoaderParams) {
  const posixReplacedFiles = files.map((file) => replaceSepToPosix(file));
  const tsfiles = await fastGlob(globPaths, { cwd });

  const filtered = tsfiles
    .filter((tsfile) => {
      return posixReplacedFiles.reduce<boolean>(
        (aggregation, current) => aggregation || tsfile.indexOf(current) >= 0,
        false,
      );
    })
    .filter((tsfile) => {
      if (prefix !== undefined && prefix !== null && prefix !== '') {
        return !path.basename(tsfile).startsWith(prefix);
      }

      return true;
    });

  return filtered;
}

async function prompt({ cwd, prefix }: Omit<ISourceFileLoaderParams, 'files'>) {
  try {
    inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

    const tsfiles = await fastGlob(globPaths, { cwd });
    const excludeJSC =
      prefix !== undefined && prefix !== null && prefix !== ''
        ? tsfiles.filter((file) => isFalse(file.startsWith(prefix)))
        : tsfiles;

    const answer = await inquirer.prompt<IPromptAnswerSelectFile>([
      {
        type: 'autocomplete',
        name: 'tsfile',
        pageSize: 20,
        message: 'Select file for JSONSchema extraction: ',
        source: (_answersSoFar: any, input: string | undefined) => {
          const safeInput = input === undefined || input === null ? '' : input;

          return fuzzy
            .filter(safeInput, excludeJSC)
            .filter((fuzzyMatched) => fuzzyMatched.string.indexOf(`${path.sep}${prefix}`) < 0)
            .filter((fuzzyMatched) => fuzzyMatched.score > 0.8)
            .sort((left, right) => right.score - left.score)
            .map((fuzzyMatched) => fuzzyMatched.string ?? '');
        },
      },
    ]);

    return [answer.tsfile];
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.debug(err);

    return [];
  }
}

export default async function sourceFileLoad({ cwd, files, prefix }: ISourceFileLoaderParams) {
  const usePrompt = files === undefined || files === null || files.length <= 0;
  const tsfiles = usePrompt ? await prompt({ cwd, prefix }) : await fileLoad({ cwd, files, prefix });

  const isExsits = await Promise.all(
    tsfiles.map((file) =>
      (async () => ({
        exists: await exists(file),
        file,
      }))(),
    ),
  );

  const existFiles = isExsits.some((exist) => isFalse(exist.exists));

  if (isTrue(existFiles)) {
    return TEI.left(new Error(`Some files not exists: ${tsfiles.join(', ')}`));
  }

  return TEI.right({
    files: tsfiles,
  });
}
