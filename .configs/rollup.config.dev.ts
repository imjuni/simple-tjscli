import { nodeResolve } from '@rollup/plugin-node-resolve';
import readPackage from 'read-pkg';
import ts from 'rollup-plugin-ts';

const pkg = readPackage.sync();
const resolveOnly = (module: string) =>
  pkg?.dependencies?.[module] == null &&
  pkg?.devDependencies?.[module] == null &&
  pkg?.peerDependencies?.[module] == null;

export default [
  {
    input: 'src/cli.ts',
    output: {
      dir: 'dist',
      format: 'cjs',
      banner: '#!/usr/bin/env node',
    },
    plugins: [nodeResolve({ resolveOnly }), ts({ tsconfig: 'tsconfig.json' })],
  },
  {
    input: 'src/ctix.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/cjs/ctix.js',
        sourcemap: true,
      },
      {
        format: 'esm',
        file: 'dist/esm/ctix.js',
        sourcemap: true,
      },
    ],
    plugins: [nodeResolve({ resolveOnly }), ts({ tsconfig: 'tsconfig.json' })],
  },
];
