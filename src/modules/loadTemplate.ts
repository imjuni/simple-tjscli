import ICommonOption from '@config/interfaces/ICommonOption';
import getOutputDirPath from '@modules/getOutputDirPath';
import posixJoin from '@tools/posixJoin';
import fs from 'fs';
import path from 'path';

export default function loadTemplate(option: ICommonOption) {
  if (option.outputType === 'json') {
    return undefined;
  }

  if (option.template !== undefined && option.template !== null) {
    return option.template;
  }

  const { templatePath } = option;
  if (templatePath !== undefined && templatePath !== null) {
    const templateDirPath = getOutputDirPath(option);
    const templateFileName = path.basename(templatePath);
    const templateFilePath = posixJoin(templateDirPath ?? '', templateFileName);

    const template = fs.readFileSync(templateFilePath).toString();
    return template;
  }

  return undefined;
}
