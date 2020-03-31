import { exists, readFile } from 'fs';
import { efail, Either, epass } from 'my-easy-fp';
import { promisify } from 'util';

export async function projectLoad({
  engine,
  project,
}: {
  engine: string;
  project: string;
}): Promise<
  Either<
    {
      project: string;
      tsconfig?: string;
    },
    Error
  >
> {
  if (!(await promisify(exists)(project))) {
    return efail(new Error(`cannot found project path: ${project}`));
  }

  if (engine === 'tjs') {
    const tsconfig = JSON.parse((await promisify(readFile)(project)).toString());

    return epass({
      project,
      tsconfig,
    });
  }

  return epass({
    project,
  });
}
