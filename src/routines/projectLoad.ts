import { exists, readFile } from 'fs';
import * as TEI from 'fp-ts/Either';
import { promisify } from 'util';

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
  if (!(await promisify(exists)(project))) {
    return TEI.left(new Error(`Could not found project path: ${project}`));
  }

  if (engine === 'tjs') {
    const tsconfig = JSON.parse((await promisify(readFile)(project)).toString());

    return TEI.right({
      project,
      tsconfig,
    });
  }

  return TEI.right({
    project,
  });
}
