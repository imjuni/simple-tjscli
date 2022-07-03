import ITsjOption from '@config/interfaces/ITsjOption';
import getOutputDirPath from '@modules/getOutputDirPath';
import IReason from '@modules/interfaces/IReason';
import fs from 'fs';
import { isEmpty, isFalse, isNotEmpty } from 'my-easy-fp';
import { exists } from 'my-node-fp';
import path from 'path';
import * as tsm from 'ts-morph';
import applyPrettier from './applyPrettier';

interface IEmptyGetDefinitions {
  type: 'empty';
  reasons: IReason[];
}

interface IGetDefinitions {
  type: 'definitions';
  reasons: IReason[];
  filePath: string;
  statement: string;
}

type TGetDefinitions = IEmptyGetDefinitions | IGetDefinitions;

export default async function getDefinitions(project: tsm.Project, option: ITsjOption): Promise<TGetDefinitions> {
  const compilerOptions = project.getCompilerOptions();
  const outputDirPath = getOutputDirPath(option);

  if (
    (isEmpty(compilerOptions.resolveJsonModule) || isFalse(compilerOptions.resolveJsonModule)) &&
    option.outputType === 'json' &&
    option.sync &&
    isNotEmpty(outputDirPath) &&
    option.seperateDefinitions
  ) {
    const reason: IReason = {
      type: 'error',
      filePath: outputDirPath,
      message:
        'seperateDefintions need output directory, sync option and enable tsconfig.json > resolveJsonModule option',
    };

    return {
      type: 'empty',
      reasons: [reason],
    };
  }

  if (
    compilerOptions.resolveJsonModule &&
    option.outputType === 'json' &&
    option.sync &&
    isNotEmpty(outputDirPath) &&
    option.seperateDefinitions
  ) {
    const definitionDirPath = path.join(outputDirPath, 'definitions', 'schemas');

    if (isFalse(await exists(definitionDirPath))) {
      await fs.promises.mkdir(definitionDirPath, { recursive: true });
    }

    const definitionFiles = await fs.promises.readdir(definitionDirPath);
    const definitionFileImportStatements = definitionFiles
      .map(
        (definitionFile) =>
          `import ${definitionFile.replace(path.extname(definitionFile), '')} from './schemas/${definitionFile}'`,
      )
      .join('\n');

    const exportStatement = `export default {\n${definitionFiles
      .map((definitionFile) => definitionFile.replace(path.extname(definitionFile), ''))
      .join(',\n')}};`;

    const prettied = await applyPrettier(
      `${definitionFileImportStatements}\n\n${exportStatement}`,
      option,
      'typescript',
    );

    return {
      type: 'definitions',
      reasons: [],
      filePath: path.join(outputDirPath, 'definitions', 'definitions.ts'),
      statement: prettied,
    };
  }

  if (option.outputType === 'ts' && option.sync && isNotEmpty(outputDirPath) && option.seperateDefinitions) {
    const definitionDirPath = path.join(outputDirPath, 'definitions', 'schemas');

    if (isFalse(await exists(definitionDirPath))) {
      await fs.promises.mkdir(definitionDirPath, { recursive: true });
    }

    const definitionFiles = await fs.promises.readdir(definitionDirPath);
    const definitionFilesWithoutExt = definitionFiles.map((definitionFile) =>
      definitionFile.replace(path.extname(definitionFile), ''),
    );
    const definitionFileImportStatements = definitionFilesWithoutExt
      .map((definitionFile) => `import ${definitionFile} from './schemas/${definitionFile}'`)
      .join('\n');

    const exportStatement = `export default {\n${definitionFiles
      .map((definitionFile) => definitionFile.replace(path.extname(definitionFile), ''))
      .join(',\n')}};`;

    const prettied = await applyPrettier(
      `${definitionFileImportStatements}\n\n${exportStatement}`,
      option,
      'typescript',
    );

    return {
      type: 'definitions',
      reasons: [],
      filePath: path.join(outputDirPath, 'definitions', 'definitions.ts'),
      statement: prettied,
    };
  }

  return {
    type: 'empty',
    reasons: [],
  };
}
