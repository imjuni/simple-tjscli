import type ICommonOption from '#config/interfaces/ICommonOption';
import { existsSync, replaceSepToPosix, win32DriveLetterUpdown } from 'my-node-fp';
import path from 'path';

export default function getFilePath(filePath: string, option: ICommonOption): string {
  if (existsSync(path.resolve(filePath))) {
    return replaceSepToPosix(win32DriveLetterUpdown(path.resolve(filePath), 'upper'));
  }

  const filePathWithCwd = path.join(option.cwd, filePath);

  return replaceSepToPosix(win32DriveLetterUpdown(path.resolve(filePathWithCwd), 'upper'));
}
