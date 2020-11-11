import debug from 'debug';
import * as fs from 'fs';
import json5 from 'json5';
import * as TEI from 'fp-ts/Either';
import * as path from 'path';
import * as util from 'util';

const log = debug('tjscli:configFileLoad');

export async function configFileLoad({ cwd }: { cwd: string }): Promise<TEI.Either<Error, { [key: string]: any }>> {
  try {
    const readFile = util.promisify(fs.readFile);
    const readed = await readFile(path.join(cwd, '.tjsclirc'));
    const configObject = json5.parse(readed.toString());

    log(configObject.format);

    return TEI.right(configObject);
  } catch (err) {
    return TEI.left(err as Error);
  }
}
