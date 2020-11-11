import { access } from 'fs';

export function aexists(filepath: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    access(filepath, (err) => {
      if (err) {
        return reject(false);
      }

      return resolve(true);
    });
  });
}
