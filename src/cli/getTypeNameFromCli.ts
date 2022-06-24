import IPromptAnswerSelectType from '@cli/interfaces/IPromptAnswerSelectType';
import getExportedName from '@compiler/getExportedName';
import getFirstExportedDeclaration from '@compiler/getFirstExportedDeclaration';
import ICommonOption from '@config/interfaces/ICommonOption';
import inquirer from 'inquirer';
import path from 'path';
import * as tsm from 'ts-morph';

interface IChoiceTypeItem {
  filePath: string;
  identifier: string;
  exportedDeclaration: tsm.ExportedDeclarations;
}

export default async function getTypeNameFromCli(project: tsm.Project, option: ICommonOption) {
  const choiceAbleTypeMap = option.files
    .map((filePath) => {
      const fileName = path.basename(filePath);
      const sourceFile = project.getSourceFileOrThrow(fileName);
      const exportedDeclarationsMap = sourceFile.getExportedDeclarations();

      const types = Array.from(exportedDeclarationsMap.entries()).map<IChoiceTypeItem>(([, exportedDeclarations]) => {
        const firstExportedDeclaration = getFirstExportedDeclaration(exportedDeclarations);

        return {
          filePath,
          identifier: getExportedName(firstExportedDeclaration),
          exportedDeclaration: firstExportedDeclaration,
        };
      });

      return types;
    })
    .flat()
    .map<{
      name: string;
      value: IChoiceTypeItem;
    }>((choiceAbleType) => ({ name: choiceAbleType.identifier, value: choiceAbleType }));

  const answer = await inquirer.prompt<IPromptAnswerSelectType>([
    {
      type: 'list',
      name: 'typeName',
      pageSize: 20,
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      choices: choiceAbleTypeMap,
    },
  ]);

  return [answer.typeName];
}
