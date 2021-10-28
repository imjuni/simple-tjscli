import debug from 'debug';
import * as fs from 'fs';
import inquirer from 'inquirer';
import * as path from 'path';
import typescript from 'typescript';
import * as TEI from 'fp-ts/Either';
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

    log('types: ', processed);

    return TEI.right(processed);
  } catch (err) {
    const refined = err instanceof Error ? err : new Error('unknown error raised');

    log(refined.message);
    log(refined.stack);

    return TEI.left(refined);
  }
}
