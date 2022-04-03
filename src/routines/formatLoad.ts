import fs from 'fs';
import path from 'path';
import util from 'util';

export default async function formatLoad({
  cwd,
  format: formatPath,
}: {
  cwd: string;
  format: string;
}): Promise<string | undefined> {
  const readFile = util.promisify(fs.readFile);
  const formatJSON = (await readFile(path.join(cwd, formatPath))).toString();

  return formatJSON;
}
