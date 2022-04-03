import consola from 'consola';
import * as fs from 'fs';
import json5 from 'json5';
import * as TEI from 'fp-ts/Either';
import * as path from 'path';
import * as util from 'util';

export default async function configFileLoad({
  cwd,
}: {
  cwd: string;
}): Promise<TEI.Either<Error, { [key: string]: any }>> {
  try {
    const readFile = util.promisify(fs.readFile);
    const readed = await readFile(path.join(cwd, '.tjsclirc'));
    const configObject = json5.parse(readed.toString());

    consola.debug(configObject.format);

    return TEI.right(configObject);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.debug(err);

    return TEI.left(err);
  }
}
