import debug from 'debug';
import { readFile as readFileCallback } from 'fs';
import inquirer from 'inquirer';
import { efail, epass } from 'my-easy-fp';
import * as path from 'path';
import typescript from 'typescript';
import { promisify } from 'util';
import { ICreateSchemaTarget } from '../interfaces/ICreateSchemaTarget';
import { IPromptAnswerSelectType } from '../interfaces/IPrompt';
import { ITjsCliOption } from '../interfaces/ITjsCliOption';

const log = debug('tjscli:interfaceload');

async function delintNode({
  file,
  source: node,
}: {
  file: string;
  source: typescript.Node;
}): Promise<ICreateSchemaTarget[]> {
  const interfaceNames: string[] = [];
  const typeAliasNames: string[] = [];

  const nodeWalk = (_node: typescript.Node) => {
    switch (_node.kind) {
      case typescript.SyntaxKind.InterfaceDeclaration:
        const interfaceDeclaration: typescript.InterfaceDeclaration = _node as any;
        interfaceNames.push(interfaceDeclaration.name.escapedText as string);
        break;
      case typescript.SyntaxKind.TypeAliasDeclaration:
        const typeAliasDeclaration: typescript.TypeAliasDeclaration = _node as any;
        typeAliasNames.push(typeAliasDeclaration.name.escapedText as string);
        break;
      case typescript.SyntaxKind.ForInStatement:
      case typescript.SyntaxKind.WhileStatement:
      case typescript.SyntaxKind.DoStatement:
      case typescript.SyntaxKind.IfStatement:
      case typescript.SyntaxKind.BinaryExpression:
        break;
    }

    typescript.forEachChild(_node, nodeWalk);
  };

  nodeWalk(node);

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
    aggregation[current.type] = current;
    return aggregation;
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

export async function interfaceLoad({ files, option }: { files: string[]; option: ITjsCliOption }) {
  try {
    const readFile = promisify(readFileCallback);

    const sourceFiles = await Promise.all(
      files.map((file) =>
        (async () => {
          return {
            file,
            source: typescript.createSourceFile(
              path.join(option.cwd, file),
              (await readFile(file)).toString(),
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

    const usingPrompt = files.length === 1 && option.types.length !== 1;
    const processed = usingPrompt ? await prompt({ types }) : optionLoad({ interfaces: types, option });

    log('types: ', processed);

    return epass(processed);
  } catch (err) {
    return efail(err);
  }
}
