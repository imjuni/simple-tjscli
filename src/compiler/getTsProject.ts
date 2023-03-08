import type ICommonOption from '#config/interfaces/ICommonOption';
import type IResolvePath from '#config/interfaces/IResolvePath';
import { isFalse } from 'my-easy-fp';
import { existsSync } from 'my-node-fp';
import type { PassFailEither } from 'my-only-either';
import { fail, pass } from 'my-only-either';
import * as tsm from 'ts-morph';

export default function getTsProject(option: ICommonOption & IResolvePath): PassFailEither<Error, tsm.Project> {
  if (isFalse(existsSync(option.resolvedProjectFilePath))) {
    return fail(new Error(`Could not found project path: ${option.resolvedProjectFilePath}`));
  }

  // Exclude exclude file in .ctiignore file: more exclude progress
  const project = new tsm.Project({ tsConfigFilePath: option.resolvedProjectFilePath });

  return pass(project);
}
