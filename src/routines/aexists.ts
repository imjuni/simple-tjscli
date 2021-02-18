import fs from 'fs';

export async function aexists(filepath: string): Promise<boolean> {
  try {
    await fs.promises.access(filepath);
    return true;
  } catch (err) {
    return false;
  }
}

export function existsSync(filepath: string): boolean {
  try {
    fs.accessSync(filepath);
    return true;
  } catch (err) {
    return false;
  }
}
