/* eslint-disable import/no-extraneous-dependencies */
import { option, series, task } from 'just-scripts';
import { exec } from 'just-scripts-utils';

option('env', { default: { env: process.env.RUN_MODE } });

task('clean', async () => {
  const cmd = 'rimraf dist artifact';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('clean:dts', async () => {
  const cmd = 'rimraf dist/src dist/example';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('+build', async () => {
  const cmd = 'tsc -p tsconfig.json --incremental';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('debug', async () => {
  const cmd = 'node -r ts-node/register --inspect-brk --nolazy src/cli.ts';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('lint', async () => {
  const cmd = 'eslint --no-ignore --ext ts,tsx,json ./src/**/*';
  const resp = await exec(cmd, { stderr: process.stderr, stdout: process.stdout });

  if (resp !== '') {
    throw new Error(`lint error: \n${resp}`);
  }
});

task('test', async () => {
  const cmd = 'jest --colors --verbose --config ./.config/jest.config.js';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('coverage', async () => {
  const cmd = 'jest --coverage --color --fail-fast --verbose --config ./.config/jest.config.js';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('dev', async () => {
  const cmd = 'ts-node ./src/cli.ts';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('+webpack:prod', async () => {
  const cmd = 'cross-env NODE_ENV=production webpack --config ./.config/webpack.config.prod.js';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('+dts-bundle', async () => {
  const cmd = 'dts-bundle-generator --no-banner dist/src/tjscli.d.ts -o dist/tjscli.d.ts';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('+webpack:dev', async () => {
  const cmd = 'cross-env NODE_ENV=production webpack --config ./.config/webpack.config.dev.js';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('+pub:prod', async () => {
  const cmd = 'npm publish --registry https://registry.npmjs.org --access=public';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('+pub:dev', async () => {
  const cmd = 'npm publish --registry http://localhost:8901 --force';
  await exec(cmd, { stderr: process.stderr, stdout: process.stdout });
});

task('build', series('clean', '+build'));
task('dts-bundle', series('+dts-bundle', 'clean:dts'));
task('pub:prod', series('clean', '+webpack:prod', '+dts-bundle', 'clean:dts', '+pub:prod'));
task('pub:dev', series('clean', '+webpack:dev', '+dts-bundle', 'clean:dts', '+pub:dev'));
task('webpack:dev', series('clean', '+webpack:dev', '+dts-bundle', 'clean:dts'));
task('webpack:prod', series('clean', '+webpack:prod', '+dts-bundle', 'clean:dts'));
