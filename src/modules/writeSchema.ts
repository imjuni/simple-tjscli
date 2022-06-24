import ICommonOption from '@config/interfaces/ICommonOption';
import IReason from '@modules/interfaces/IReason';
import TOutputJSONSchema from '@modules/interfaces/TOutputJSONSchema';
import colors from 'colors';
import consola from 'consola';
import fs from 'fs';
import { isFalse } from 'my-easy-fp';
import { exists, getDirname, getDirnameSync } from 'my-node-fp';

export default async function writeSchema(schema: TOutputJSONSchema, option: ICommonOption) {
  const dirPath = getDirnameSync(schema.outputFilePath);

  if (isFalse(await exists(dirPath))) {
    consola.debug(`Create Directory: ${dirPath}`);
    await fs.promises.mkdir(dirPath, { recursive: true });
  }

  if ((await exists(schema.outputFilePath)) && isFalse(option.overwrite)) {
    const reason: IReason = {
      type: 'warn',
      filePath: schema.filePath,
      message: `already exist file ${colors.yellow(schema.filePath)}`,
    };

    return [reason];
  }

  const outputDirPath = await getDirname(schema.outputFilePath);

  if (isFalse(await exists(outputDirPath))) {
    consola.debug(`Create Directory: ${dirPath}`);
    await fs.promises.mkdir(outputDirPath, { recursive: true });
  }

  await fs.promises.writeFile(schema.outputFilePath, schema.formatted);

  return [];
}
