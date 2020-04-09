import chalk from 'chalk';
import debug from 'debug';
import { efail, epass, isFail, isNotEmpty } from 'my-easy-fp';
import { ITjsCliOption } from '../interfaces/ITjsCliOption';
import { extractJSONSchemaByTJS } from './extractJSONSchemaByTJS';
import { formatLoad } from './formatLoad';
import { interfaceLoad } from './interfaceLoad';
import { projectLoad } from './projectLoad';
import { sourceFileLoad } from './sourceFileLoad';

const log = debug('tjscli:engineTjs');

export async function engineTjs(formatFromConfig: string | undefined, option: ITjsCliOption) {
  const format =
    formatFromConfig ??
    (isNotEmpty(option.formatPath) ? await formatLoad({ cwd: option.cwd, format: option.formatPath }) : undefined);
  const project = await projectLoad({ project: option.project, engine: option.engine });

  if (isFail(project)) {
    return efail(project.fail);
  }

  console.log(chalk.green('Project: ', project.pass.project));

  const sources = await sourceFileLoad({ cwd: option.cwd, files: option.files });

  if (isFail(sources)) {
    return efail(sources.fail);
  }

  console.log(chalk.green('Source: ', sources.pass.files.join(', ')));

  const interfaces = await interfaceLoad({ files: sources.pass.files, option });

  if (isFail(interfaces)) {
    return efail(interfaces.fail);
  }

  console.log(chalk.green('Type: ', interfaces.pass.join(', ')));

  log('foramt: ', format);
  log('proejct: ', option.cwd, project.pass);
  log('sources: ', sources.pass);
  log('interfaces: ', interfaces.pass);

  const results = await Promise.all(
    interfaces.pass.map((target) => extractJSONSchemaByTJS({ target, option, format })),
  );

  results.forEach((result) => {
    if (isFail(result)) {
      log(result.fail.message);
      log(result.fail.stack);
    }
  });

  return epass(true);
}
