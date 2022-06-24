import ITjsOption from '@config/interfaces/ITjsOption';
import ITsjOption from '@config/interfaces/ITsjOption';
import TGeneratedJSONSchema from '@modules/interfaces/TGenerateJSONSchema';
import posixJoin from '@tools/posixJoin';
import { getDirnameSync } from 'my-node-fp';

export default function getOutputFilePath(generatedSchema: TGeneratedJSONSchema, option: ITjsOption | ITsjOption) {
  const sourceFilePath = generatedSchema.filePath;
  const sourceDirPath = getDirnameSync(sourceFilePath);
  const sourceFileName = generatedSchema.typeName;
  const outputDirPath = option.output ?? sourceDirPath;

  if (option.outputType === 'json') {
    const relativeDirPath = sourceDirPath.replace(option.cwd, '');

    const prefixedSourceFileName = [option.prefix ?? '', sourceFileName, '.json'].join('');
    const outputFilePath = posixJoin(outputDirPath, relativeDirPath, prefixedSourceFileName);
    return outputFilePath;
  }

  const relativeDirPath = sourceDirPath.replace(option.cwd, '');

  const prefixedSourceFileName = [option.prefix ?? '', sourceFileName, option.extName].join('');
  const outputFilePath = posixJoin(outputDirPath, relativeDirPath, prefixedSourceFileName);
  return outputFilePath;
}
