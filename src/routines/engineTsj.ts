import { ITjsCliOption } from '@interfaces/ITjsCliOption';
import extractJSONSchemaByTSJ from '@routines/extractJSONSchemaByTSJ';
import formatLoad from '@routines/formatLoad';
import interfaceLoad from '@routines/interfaceLoad';
import projectLoad from '@routines/projectLoad';
import sourceFileLoad from '@routines/sourceFileLoad';
import chalk from 'chalk';
import consola from 'consola';
import console from 'console';
import * as TEI from 'fp-ts/Either';
import { isNotEmpty } from 'my-easy-fp';

export default async function engineTsj(formatFromConfig: string | undefined, option: ITjsCliOption) {
  const format =
    formatFromConfig ??
    (isNotEmpty(option.formatPath) ? await formatLoad({ cwd: option.cwd, format: option.formatPath }) : undefined);
  const project = await projectLoad({ project: option.project, engine: option.engine });

  if (TEI.isLeft(project)) {
    return TEI.left(project.left);
  }

  console.log(chalk.green('Project: ', project.right.project));

  const sources = await sourceFileLoad({ cwd: option.cwd, files: option.files });

  if (TEI.isLeft(sources)) {
    return TEI.left(sources.left);
  }

  console.log(chalk.green('Source: ', sources.right.files.join(', ')));

  const interfaces = await interfaceLoad({ files: sources.right.files, option });

  if (TEI.isLeft(interfaces)) {
    return TEI.left(interfaces.left);
  }

  console.log(chalk.green('Type: ', interfaces.right.map((interfaceInfo) => interfaceInfo.type).join(', ')));

  consola.debug('foramt: ', format);
  consola.debug('proejct: ', option.cwd, project.right);
  consola.debug('sources: ', sources.right);
  consola.debug('interfaces: ', interfaces.right);

  const results = await Promise.all(
    interfaces.right.map((target) => extractJSONSchemaByTSJ({ target, option, format })),
  );

  const lefts = results.filter((result): result is TEI.Left<Error> => TEI.isLeft(result));

  const messages = lefts.map(
    (left) =>
      `>>> ---------------------------------------------------------------------------\n${left.left.message}\n\n${
        left.left.stack ?? ''
      }`,
  );

  console.log(chalk.redBright(messages.join('\n')));

  if (lefts.length > 0) {
    return TEI.left(new Error(messages.join('\n')));
  }

  return TEI.right(true);
}
