import IPromptAnswerSelectFile from '@cli/interfaces/IPromptAnswerSelectFile';
import ICommonOption from '@config/interfaces/ICommonOption';
import getFilePath from '@modules/getFilePath';
import fastGlobWrap from '@tools/fastGlobWrap';
import posixJoin from '@tools/posixJoin';
import Fuse from 'fuse.js';
import inquirer from 'inquirer';
import inquirerAutocompletePrompt from 'inquirer-autocomplete-prompt';
import { bignumber } from 'mathjs';
import { isFalse } from 'my-easy-fp';

const globPaths = ['**/*.ts', '**/*.mts', '**/*.cts', '**/*.tsx'];

export default async function getFileNameFromCli(option: ICommonOption) {
  inquirer.registerPrompt('autocomplete', inquirerAutocompletePrompt);

  const tsFiles = await fastGlobWrap(globPaths, {
    cwd: option.cwd,
    ignore: ['node_modules', 'dist/**', 'artifact/**', '**/*.d.ts', '**/__test__', '**/__tests__'],
  });

  const { prefix } = option;

  const excludePrefix =
    prefix !== undefined && prefix !== null && prefix !== ''
      ? tsFiles.filter((file) => isFalse(file.startsWith(prefix)))
      : tsFiles;
  const fuse = new Fuse(excludePrefix, { includeScore: true });

  const answer = await inquirer.prompt<IPromptAnswerSelectFile>([
    {
      type: 'autocomplete',
      name: 'tsFile',
      pageSize: 20,
      message: 'Select file for JSONSchema extraction: ',
      source: (_answersSoFar: any, input: string | undefined) => {
        const safeInput = input === undefined || input === null ? '' : input;

        return fuse
          .search(safeInput)
          .map((matched) => {
            return {
              ...matched,
              oneBased: bignumber(1)
                .sub(bignumber(matched.score ?? 0))
                .mul(100)
                .floor()
                .div(100)
                .toNumber(),
              percent: bignumber(1)
                .sub(bignumber(matched.score ?? 0))
                .mul(10000)
                .floor()
                .div(100)
                .toNumber(),
            };
          })
          .filter((matched) => matched.percent > 80)
          .sort((l, r) => r.percent - l.percent)
          .map((matched) => matched.item);
      },
    },
  ]);

  return [getFilePath(posixJoin(option.cwd, answer.tsFile), option)];
}
