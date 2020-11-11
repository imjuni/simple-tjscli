import debug from 'debug';
import * as TEI from 'fp-ts/Either';
import prettier from 'prettier';
import { ICreateSchemaTarget } from '../interfaces/ICreateSchemaTarget';
import { ITjsCliOption } from '../interfaces/ITjsCliOption';

const log = debug('tjscli:prettierProcessing');

export async function prettierProcessing({
  format,
  target,
  filename,
  contents,
  option,
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

    const prettierOption = await prettier.resolveConfig(option.cwd);
    const prettiered = prettier.format(
      processed,
      prettierOption === null
        ? {
            singleQuote: true,
            trailingComma: 'all',
            printWidth: 120,
            arrowParens: 'always',
            parser: 'typescript',
          }
        : prettierOption,
    );

    return TEI.right(prettiered);
  } catch (err) {
    return TEI.left(err as Error);
  }
}
