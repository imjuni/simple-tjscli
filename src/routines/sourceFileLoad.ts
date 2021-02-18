import debug from 'debug';
import fastGlob from 'fast-glob';
import * as TEI from 'fp-ts/Either';
import fuzzy from 'fuzzy';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { isFalse, isTrue } from 'my-easy-fp';
import * as path from 'path';
import { IPromptAnswerSelectFile } from '../interfaces/IPrompt';
import { aexists } from './aexists';

const log = debug('tjscli:cli');

async function fileLoad({ cwd, files }: { cwd: string; files: string[] }) {
  const tsfiles = await fastGlob(['**/*.ts', '!node_modules', '!artifact/**', '!**/*.d.ts', '!**/__test__'], { cwd });
  const filtered = tsfiles
    .filter((tsfile) =>
      files.reduce<boolean>((aggregation, current) => aggregation || tsfile.indexOf(current) >= 0, false),
    )
    .filter((tsfile) => !path.basename(tsfile).startsWith('JSC_'));

  return filtered;
}

async function prompt({ cwd }: { cwd: string }) {
  try {
    inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

    const tsfiles = await fastGlob(['**/*.ts', '!node_modules', '!artifact/**', '!**/*.d.ts', '!**/__test__'], { cwd });
    const excludeJSC = tsfiles.filter((file) => isFalse(file.startsWith('JSC_')));

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
            .filter((fuzzyMatched) => fuzzyMatched.string.indexOf(`${path.sep}JSC_`) < 0)
            .filter((fuzzyMatched) => fuzzyMatched.score > 0.8)
            .sort((left, right) => right.score - left.score)
            .map((fuzzyMatched) => fuzzyMatched.string ?? '');
        },
      },
    ]);

    return [answer.tsfile];
  } catch (err) {
    log('Error occured: ', err.message);
    log('Error occured: ', err.stack);

    return [];
  }
}

export async function sourceFileLoad({ cwd, files }: { cwd: string; files: string[] }) {
  const usePrompt = files === undefined || files === null || files.length <= 0;
  const tsfiles = usePrompt ? await prompt({ cwd }) : await fileLoad({ cwd, files });

  const isExsits = await Promise.all(
    tsfiles.map((file) =>
      (async () => ({
        exists: await aexists(file),
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
