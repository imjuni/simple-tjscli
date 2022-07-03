import { replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';

export default function getWorkingDirectory(cwd?: string) {
  const processCwd = process.cwd();

  if (cwd === undefined || cwd === null) {
    return processCwd;
  }

  if (path.isAbsolute(cwd)) {
    return replaceSepToPosix(win32DriveLetterUpdown(path.resolve(cwd)));
  }

  return replaceSepToPosix(win32DriveLetterUpdown(path.resolve(path.join(processCwd, cwd))));
}
