import type ICommonOption from '#config/interfaces/ICommonOption';
import consola from 'consola';
import { isError } from 'my-easy-fp';
import path from 'path';
import type { Options } from 'prettier';
import prettier from 'prettier';

function getParser(
  option: ICommonOption,
  rawOptionParser?: Options['parser'],
  parser?: Options['parser'],
): Options['parser'] {
  if (parser !== undefined && parser !== null) {
    return parser;
  }

  if (option.outputType === 'json' && rawOptionParser === 'typescript') {
    return 'json';
  }

  if (option.outputType === 'json' && rawOptionParser === 'json') {
    return 'json';
  }

  if (option.outputType === 'ts' && rawOptionParser === 'json') {
    return 'typescript';
  }

  return 'typescript';
}

export default async function applyPrettier(
  contents: string,
  option: ICommonOption,
  parser?: Options['parser'],
): Promise<string> {
  try {
    const rawOption = await prettier.resolveConfig(path.join(option.cwd, '.prettierrc'), { editorconfig: true });
    const prettierOption: Options =
      rawOption === null
        ? {
            singleQuote: true,
            trailingComma: 'all',
            printWidth: 80,
            arrowParens: 'always',
            parser: getParser(option, undefined, parser),
          }
        : { ...rawOption, parser: getParser(option, rawOption.parser, parser) };

    const prettiered = prettier.format(contents, prettierOption);

    return prettiered;
  } catch (catched) {
    const err = isError(catched) ?? new Error('unknown error raised');
    consola.debug(err);

    return contents;
  }
}
