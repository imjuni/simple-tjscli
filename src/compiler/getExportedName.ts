import { isEmpty, isNotEmpty } from 'my-easy-fp';
import * as tsm from 'ts-morph';

export default function getExportedName(exportedDeclarationNode: tsm.ExportedDeclarations): string {
  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.ClassDeclaration))) {
    const classDeclarationNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.ClassDeclaration);

    return classDeclarationNode.getNameOrThrow().toString();
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.VariableDeclaration))) {
    const variableDeclarationNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.VariableDeclaration);
    return variableDeclarationNode.getName();
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.ArrowFunction))) {
    const arrowFunctionNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.ArrowFunction);
    const name = arrowFunctionNode.getSymbolOrThrow().getEscapedName();

    if (name === '__function') {
      throw new Error('cannot generate JSONSchema using by anonymous arrow function');
    }
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.FunctionDeclaration))) {
    const functionDeclarationNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.FunctionDeclaration);

    const name = functionDeclarationNode.getName();

    if (isEmpty(name)) {
      throw new Error('cannot generate JSONSchema using by anonymous function');
    }

    return functionDeclarationNode.getNameOrThrow().toString();
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.InterfaceDeclaration))) {
    const interfaceDeclarationNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.InterfaceDeclaration);
    return interfaceDeclarationNode.getName();
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.TypeAliasDeclaration))) {
    const typeAliasDeclarationNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.TypeAliasDeclaration);
    return typeAliasDeclarationNode.getName();
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.EnumDeclaration))) {
    const enumDeclarationNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.EnumDeclaration);
    return enumDeclarationNode.getName();
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.ModuleDeclaration))) {
    const moduleDeclarationNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.ModuleDeclaration);
    return moduleDeclarationNode.getName();
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.ArrayLiteralExpression))) {
    throw new Error('cannot generate JSONSchema using by anonymous function');
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.ObjectLiteralExpression))) {
    throw new Error('cannot generate JSONSchema using by anonymous function');
  }

  if (isNotEmpty(exportedDeclarationNode.asKind(tsm.SyntaxKind.BindingElement))) {
    const bindingElementNode = exportedDeclarationNode.asKindOrThrow(tsm.SyntaxKind.BindingElement);
    return bindingElementNode.getName();
  }

  throw new Error(`Cannot support type: (${exportedDeclarationNode.getKind()}) ${exportedDeclarationNode.getText()}`);
}
