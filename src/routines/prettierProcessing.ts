import { efail, epass } from 'my-easy-fp';
import prettier from 'prettier';
import { ICreateSchemaTarget } from '../interfaces/ICreateSchemaTarget';
import { ITjsCliOption } from '../interfaces/ITjsCliOption';

export async function prettierProcessing({
  format,
  target,
  contents,
  option,
}: {
  target: ICreateSchemaTarget;
  format: string | undefined;
  contents: string;
  option: ITjsCliOption;
}) {
  try {
    const processed =
      format !== undefined
        ? format
            .replace(/\\n/g, '\n')
            .replace(/\%\{\{TYPE_NAME\}\}\%/g, target.type)
            .replace(/\%\{\{SCHEMA_JSON_CONTENT\}\}\%/g, contents)
        : contents;

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

    return epass(prettiered);
  } catch (err) {
    return efail(err);
  }
}
