import posixJoin from '#tools/posixJoin';
import * as env from '#tools/testenv';

export default [
  {
    sourceFilePath: posixJoin(env.exampleType01Path, 'ICollege.ts'),
    exportedDeclarations: [
      {
        identifier: 'ICollege',
      },
    ],
  },
];
