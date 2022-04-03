import { ICreateSchemaTarget } from '@interfaces/ICreateSchemaTarget';
import { IPromptAnswerSelectType } from '@interfaces/IPrompt';
import { ITjsCliOption } from '@interfaces/ITjsCliOption';
import consola from 'consola';
import * as TEI from 'fp-ts/Either';
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as path from 'path';
import typescript from 'typescript';

function anyCasting<T>(node: typescript.Node): T {
  return node as any as T;
}

async function delintNode({ file, source }: { file: string; source: typescript.Node }): Promise<ICreateSchemaTarget[]> {
  const interfaceNames: string[] = [];
  const typeAliasNames: string[] = [];

  const nodeWalk = (node: typescript.Node) => {
    let interfaceDeclaration: typescript.InterfaceDeclaration;
    let typeAliasDeclaration: typescript.TypeAliasDeclaration;

    switch (node.kind) {
      case typescript.SyntaxKind.InterfaceDeclaration:
        interfaceDeclaration = anyCasting(node);
        interfaceNames.push(interfaceDeclaration.name.escapedText as string);
        break;
      case typescript.SyntaxKind.TypeAliasDeclaration:
        typeAliasDeclaration = anyCasting(node);
        typeAliasNames.push(typeAliasDeclaration.name.escapedText as string);
        break;
      case typescript.SyntaxKind.ForInStatement:
      case typescript.SyntaxKind.WhileStatement:
      case typescript.SyntaxKind.DoStatement:
      case typescript.SyntaxKind.IfStatement:
      case typescript.SyntaxKind.BinaryExpression:
        break;
      default:
        break;
    }

    typescript.forEachChild(node, nodeWalk);
  };

  nodeWalk(source);

  const interfaceTargets: ICreateSchemaTarget[] = interfaceNames.map((interfaceName) => ({
    type: interfaceName,
    file,
    syntax: 'interface',
  }));

  const typeAliasTargets: ICreateSchemaTarget[] = typeAliasNames.map((typeAliasName) => ({
    type: typeAliasName,
    file,
    syntax: 'type',
  }));

  return interfaceTargets.concat(typeAliasTargets);
}

async function prompt({ types }: { types: ICreateSchemaTarget[] }) {
  const typeNames = types.map((typeName) => typeName.type);
  const typeMap = types.reduce<{ [key: string]: ICreateSchemaTarget }>((aggregation, current) => {
    return { ...aggregation, [current.type]: current };
  }, {});

  const answer = await inquirer.prompt<IPromptAnswerSelectType>([
    {
      type: 'list',
      name: 'typename',
      pageSize: 20,
      message: 'Select type(interface or type alias) for JSONSchema extraction: ',
      choices: typeNames,
    },
  ]);

  return [typeMap[answer.typename]];
}

function optionLoad({ interfaces, option }: { interfaces: ICreateSchemaTarget[]; option: ITjsCliOption }) {
  try {
    // return all interface type, that not entered type name
    if (option.types === undefined || option.types === null || option.types.length <= 0) {
      return interfaces;
    }

    return interfaces.filter((interfaceName) => {
      return option.types.reduce<boolean>((aggregation, current) => {
        return aggregation || interfaceName.type.indexOf(current) >= 0;
      }, false);
    });
  } catch (err) {
    return [];
  }
}

export default async function interfaceLoad({ files, option }: { files: string[]; option: ITjsCliOption }) {
  try {
    const sourceFiles = await Promise.all(
      files.map((file) =>
        (async () => {
          return {
            file,
            source: typescript.createSourceFile(
              path.join(option.cwd, file),
              (await fs.promises.readFile(file)).toString(),
              typescript.ScriptTarget.ES2017,
              /* setParentNodes */ true,
            ),
          };
        })(),
      ),
    );

    const types = (await Promise.all(sourceFiles.map((sourceFile) => delintNode(sourceFile)))).reduce((prev, current) =>
      prev.concat(current),
    );

    const usingPrompt = files.length === 1 && option.types.length !== 1 && types.length !== 1;

    if (usingPrompt && types.length === 0) {
      return TEI.left(new Error(`Not exists interface or type in ${files.join(', ')}`));
    }

    const processed = usingPrompt ? await prompt({ types }) : optionLoad({ interfaces: types, option });

    consola.debug('types: ', processed);

    return TEI.right(processed);
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.debug(err);

    return TEI.left(err);
  }
}
