import ICommonOption from '@config/interfaces/ICommonOption';
import applyFormat from '@modules/applyFormat';
import applyPrettier from '@modules/applyPrettier';
import getBanner from '@modules/getBanner';
import getOutputDirPath from '@modules/getOutputDirPath';
import IReason from '@modules/interfaces/IReason';
import TOutputJSONSchema from '@modules/interfaces/TOutputJSONSchema';
import { JSONSchema7 } from 'json-schema';
import { isNotEmpty } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';
import { TraversalCallback, TraversalCallbackContext, traverse } from 'object-traversal';
import path from 'path';
import * as TJS from 'typescript-json-schema';

export default async function aggregateDefinitions(schemas: TOutputJSONSchema[], option: ICommonOption) {
  const outputDirPath = getOutputDirPath(option);

  const tsExtName = option.extName.startsWith('.') ? option.extName : `.${option.extName}`;
  const extName = option.outputType === 'json' ? '.json' : tsExtName;

  if (outputDirPath === undefined || outputDirPath === null) {
    return {
      reasons: [],
      definitions: [],
    };
  }

  const definitions = schemas
    .map((schema) =>
      Object.entries(schema.definitions).map<
        | { generator: 'tsj'; filePath: string; typeName: string; schema: JSONSchema7 }
        | { generator: 'tjs'; filePath: string; typeName: string; schema: TJS.Definition }
      >(([typeName, jsonschema]) => {
        if (schema.generator === 'tsj') {
          const schemaElement: { generator: 'tsj'; filePath: string; typeName: string; schema: JSONSchema7 } = {
            generator: 'tsj',
            filePath: schema.filePath,
            typeName,
            schema: jsonschema,
          };

          return schemaElement;
        }

        const schemaElement: { generator: 'tjs'; filePath: string; typeName: string; schema: TJS.Definition } = {
          generator: 'tjs',
          filePath: schema.filePath,
          typeName,
          schema: jsonschema,
        };

        return schemaElement;
      }),
    )
    .flat();

  const traverseHandle: TraversalCallback = ({ parent, key, value }: TraversalCallbackContext): any => {
    if (parent !== undefined && parent !== null && key !== undefined && key !== null && key === '$ref') {
      // eslint-disable-next-line no-param-reassign
      parent[key] = value.replace('#/definitions/', '');
    }

    return parent;
  };

  const changeExternalDefinitionJSONSchemas = definitions.map((schema) => {
    traverse(schema.schema, traverseHandle);
    return schema;
  });

  const definitionMap = changeExternalDefinitionJSONSchemas.reduce<Record<string, number>>(
    (aggregation, definition) => {
      if (aggregation[definition.typeName] !== undefined && aggregation[definition.typeName] !== null) {
        return { ...aggregation, [definition.typeName]: aggregation[definition.typeName] + 1 };
      }

      return { ...aggregation, [definition.typeName]: 0 };
    },
    {},
  );

  const errorTypeNames = Object.entries(definitionMap)
    .filter(([, count]) => {
      return count > 1;
    })
    .map(([typeName, count]) => ({ typeName, count }));

  // Check duplication of Definition in One file
  const reasons = errorTypeNames.map((errorTypeName) => {
    const reason: IReason = {
      type: 'error',
      filePath: `${errorTypeName.typeName}${option.extName.startsWith('.') ? option.extName : `${extName}`}`,
      message: `Detect duplicate definition: ${errorTypeName.typeName} * ${errorTypeName.count}`,
    };

    return reason;
  });

  const definisionSchemas = definitions
    .map((definition) => {
      if (definitionMap[definition.typeName] > 1) {
        return undefined;
      }

      if (definition.generator === 'tjs') {
        const schemaDefinition: TOutputJSONSchema = {
          reasons: [],
          generator: definition.generator,
          banner: getBanner(definition.generator, option),
          filePath: definition.filePath,
          typeName: definition.typeName,
          schema: definition.schema,
          formatted: '',
          outputFilePath: replaceSepToPosix(
            path.join(outputDirPath, 'definitions', 'schemas', `${definition.typeName}${extName}`),
          ),
          definitions: {},
        };

        return schemaDefinition;
      }

      const schemaDefinition: TOutputJSONSchema = {
        reasons: [],
        generator: definition.generator,
        banner: getBanner(definition.generator, option),
        filePath: definition.filePath,
        typeName: definition.typeName,
        schema: definition.schema,
        formatted: '',
        outputFilePath: replaceSepToPosix(
          path.join(outputDirPath, 'definitions', 'schemas', `${definition.typeName}${extName}`),
        ),
        definitions: {},
      };

      return schemaDefinition;
    })
    .filter((schema): schema is TOutputJSONSchema => isNotEmpty(schema));

  const formattedDefinisionSchemas = definisionSchemas.map((schema) => {
    const formatted = applyFormat(
      { banner: schema.banner, variableName: schema.typeName, jsonSchemaContent: schema.schema },
      option,
    );
    return { ...schema, formatted };
  });

  const prettierAppliedDefinisionSchemas = await Promise.all(
    formattedDefinisionSchemas.map<Promise<TOutputJSONSchema>>(async (schema) => {
      const formatted = await applyPrettier(schema.formatted, option);
      return { ...schema, formatted };
    }),
  );

  return {
    reasons,
    definitions: prettierAppliedDefinisionSchemas,
  };
}
