import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
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
    plugins: [nodeResolve({ resolveOnly }), ts({ tsconfig: 'tsconfig.json' }), terser()],
  },
  {
    input: 'src/tjscli.ts',
    output: [
      {
        format: 'cjs',
        file: 'dist/cjs/tjscli.js',
        sourcemap: true,
      },
      {
        format: 'esm',
        file: 'dist/esm/tjscli.js',
        sourcemap: true,
      },
    ],

    plugins: [nodeResolve({ resolveOnly }), ts({ tsconfig: 'tsconfig.json' }), terser()],
  },
];
