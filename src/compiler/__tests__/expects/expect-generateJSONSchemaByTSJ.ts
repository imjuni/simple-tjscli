import posixJoin from '@tools/posixJoin';
import * as env from '@tools/testenv';

export default [
  {
    generator: 'tsj',
    filePath: posixJoin(env.exampleType01Path, 'ICollege.ts'),
    typeName: 'ICollege',
    schema: {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties: {
        name: {
          type: 'string',
          minLength: 2,
          maxLength: 255,
        },
        address: {
          type: 'string',
          minLength: 64,
          maxLength: 1024,
        },
        professors: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                minLength: 2,
                maxLength: 255,
              },
              major: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 255,
                  },
                  desc: {
                    type: 'string',
                    maxLength: 2048,
                  },
                },
                required: ['name'],
              },
              college: {
                $ref: '#/definitions/interface-1526749392-47-245-1526749392-0-246',
              },
            },
            required: ['name', 'major', 'college'],
          },
        },
      },
      required: ['name', 'address', 'professors'],
      definitions: {
        'interface-1526749392-47-245-1526749392-0-246': {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 255,
            },
            address: {
              type: 'string',
              minLength: 64,
              maxLength: 1024,
            },
            professors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: {
                    type: 'string',
                    minLength: 2,
                    maxLength: 255,
                  },
                  major: {
                    type: 'object',
                    properties: {
                      name: {
                        type: 'string',
                        minLength: 2,
                        maxLength: 255,
                      },
                      desc: {
                        type: 'string',
                        maxLength: 2048,
                      },
                    },
                    required: ['name'],
                  },
                  college: {
                    $ref: '#/definitions/interface-1526749392-47-245-1526749392-0-246',
                  },
                },
                required: ['name', 'major', 'college'],
              },
            },
          },
          required: ['name', 'address', 'professors'],
        },
      },
    },
  },
];
