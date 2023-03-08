import type ITsjOption from '#config/interfaces/ITsjOption';
import type getDefinitions from '#modules/getDefinitions';
import getOutputDirPath from '#modules/getOutputDirPath';
import fs from 'fs';
import type { TResolvePromise } from 'my-easy-fp';
import { exists } from 'my-node-fp';

export default async function writeDefinitionModule(
  module: TResolvePromise<ReturnType<typeof getDefinitions>>,
  option: ITsjOption,
) {
  const outputDirPath = getOutputDirPath(option);

  if (
    module.type === 'definitions' &&
    outputDirPath !== undefined &&
    outputDirPath !== null &&
    (await exists(outputDirPath))
  ) {
    await fs.promises.writeFile(module.filePath, module.statement);
  }
}
