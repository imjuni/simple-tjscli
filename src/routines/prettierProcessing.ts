import debug from 'debug';
import * as TEI from 'fp-ts/Either';
import prettier, { Options } from 'prettier';
import { ICreateSchemaTarget } from '../interfaces/ICreateSchemaTarget';
import { ITjsCliOption } from '../interfaces/ITjsCliOption';

const log = debug('tjscli:prettierProcessing');

export async function prettierProcessing({
  format,
  target,
  filename,
  contents,
  option: tjsCliOption,
}: {
  target: ICreateSchemaTarget;
  format: string | undefined;
  filename: string;
  contents: string;
  option: ITjsCliOption;
}) {
  try {
    log('processed: ', format);

    const processed =
      format !== undefined
        ? format
            .replace(/\\n/g, '\n')
            .replace(/\%\{\{TYPE_NAME\}\}\%/g, target.type)
            .replace(/\%\{\{SCHEMA_JSON_CONTENT\}\}\%/g, contents)
        : `// tslint:disable-next-line variable-name\nexport const ${filename} = ${contents}`;

    const rawOption = await prettier.resolveConfig(tjsCliOption.cwd, { editorconfig: true });
    const option: Options =
      rawOption === null
        ? {
            singleQuote: true,
            trailingComma: 'all',
            printWidth: 120,
            arrowParens: 'always',
            parser: 'typescript',
          }
        : { ...rawOption, parser: rawOption.parser ?? 'typescript' };

    const prettiered = prettier.format(processed, option);

    return TEI.right(prettiered);
  } catch (err) {
    const refined = err instanceof Error ? err : new Error('unknown error raised');

    log(refined.message);
    log(refined.stack);

    return TEI.left(refined);
  }
}
