import debug from 'debug';
import * as fs from 'fs';
import json5 from 'json5';
import { efail, Either, epass } from 'my-easy-fp';
import * as path from 'path';
import * as util from 'util';

const log = debug('tjscli:configFileLoad');

export async function configFileLoad({ cwd }: { cwd: string }): Promise<Either<{ [key: string]: any }, Error>> {
  try {
    const readFile = util.promisify(fs.readFile);
    const readed = await readFile(path.join(cwd, '.tjsclirc'));
    const configObject = json5.parse(readed.toString());

    log(configObject.format);

    return epass(configObject);
  } catch (err) {
    return efail(err);
  }
}
