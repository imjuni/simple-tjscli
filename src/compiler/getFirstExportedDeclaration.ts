import * as tsm from 'ts-morph';

export default function getFirstExportedDeclaration(
  exportedDeclarations: tsm.ExportedDeclarations[],
): tsm.ExportedDeclarations {
  const [exportedDeclaration] = exportedDeclarations;
  return exportedDeclaration;
}
