import ICommonOption from '@config/interfaces/ICommonOption';
import { replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';

export default function getOutputDirPath(option: ICommonOption) {
  if (option.output === undefined || option.output === null) {
    return undefined;
  }

  if (path.isAbsolute(option.output)) {
    const outputDirPath = replaceSepToPosix(win32DriveLetterUpdown(option.output, 'upper'));
    return outputDirPath;
  }

  const outputDirPath = replaceSepToPosix(
    win32DriveLetterUpdown(path.resolve(path.join(option.cwd, option.output)), 'upper'),
  );

  return outputDirPath;
}
