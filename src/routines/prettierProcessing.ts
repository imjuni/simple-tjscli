import { ICreateSchemaTarget } from '@interfaces/ICreateSchemaTarget';
import { ITjsCliOption } from '@interfaces/ITjsCliOption';
import consola from 'consola';
import * as TEI from 'fp-ts/Either';
import prettier, { Options } from 'prettier';

export default async function prettierProcessing({
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
    consola.debug('processed: ', format);

    const processed =
      format !== undefined
        ? format
            .replace(/\\n/g, '\n')
            .replace(/%\{\{TYPE_NAME\}\}%/g, target.type)
            .replace(/%\{\{SCHEMA_JSON_CONTENT\}\}%/g, contents)
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
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.debug(err);

    return TEI.left(err);
  }
}
