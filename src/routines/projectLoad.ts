import * as TEI from 'fp-ts/Either';
import fs from 'fs';
import { isFalse } from 'my-easy-fp';
import { aexists } from './aexists';

export async function projectLoad({
  engine,
  project,
}: {
  engine: string;
  project: string;
}): Promise<
  TEI.Either<
    Error,
    {
      project: string;
      tsconfig?: string;
    }
  >
> {
  if (isFalse(await aexists(project))) {
    return TEI.left(new Error(`Could not found project path: ${project}`));
  }

  if (engine === 'tjs') {
    const tsconfig = JSON.parse((await fs.promises.readFile(project)).toString());

    return TEI.right({
      project,
      tsconfig,
    });
  }

  return TEI.right({
    project,
  });
}
