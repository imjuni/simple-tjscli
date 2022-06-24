import posixJoin from '@tools/posixJoin';
import * as env from '@tools/testenv';

export default [
  {
    generator: 'tjs',
    filePath: posixJoin(env.exampleType01Path, 'ICollege.ts'),
    typeName: 'ICollege',
    schema: {
      $ref: '#/definitions/ICollege',
      definitions: {
        IProfessor: {
          type: 'object',
          properties: {
            name: {
              minLength: 2,
              maxLength: 255,
              type: 'string',
            },
            major: {
              $ref: '#/definitions/IMajor',
            },
            college: {
              $ref: '#/definitions/ICollege',
            },
          },
          required: ['college', 'major', 'name'],
        },
        IMajor: {
          type: 'object',
          properties: {
            name: {
              minLength: 2,
              maxLength: 255,
              type: 'string',
            },
            desc: {
              maxLength: 2048,
              type: 'string',
            },
          },
          required: ['name'],
        },
        ICollege: {
          type: 'object',
          properties: {
            name: {
              minLength: 2,
              maxLength: 255,
              type: 'string',
            },
            address: {
              minLength: 64,
              maxLength: 1024,
              type: 'string',
            },
            professors: {
              type: 'array',
              items: {
                $ref: '#/definitions/IProfessor',
              },
            },
          },
          required: ['address', 'name', 'professors'],
        },
      },
      $schema: 'http://json-schema.org/draft-07/schema#',
    },
  },
];
