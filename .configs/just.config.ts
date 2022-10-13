/* eslint-disable import/no-extraneous-dependencies */
import execa from 'execa';
import { series, task } from 'just-task';

function splitArgs(args: string): string[] {
  return args
    .split(' ')
    .map((arg) => arg.trim())
    .filter((arg) => arg != '');
}

task('clean', async () => {
  const cmd = 'rimraf';
  const option = 'dist artifact';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('clean:dts', async () => {
  const cmd = 'rimraf';
  const option = 'dist/src dist/example';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('+build', async () => {
  const cmd = 'tsc';
  const option = '-p tsconfig.json --incremental';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('debug', async () => {
  const cmd = 'node';
  const option = '-r ts-node/register --inspect-brk --nolazy src/cli.ts';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('lint', async () => {
  const cmd = 'eslint';
  const option = '--cache .';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('+webpack:prod', async () => {
  const cmd = 'webpack';
  const option = '--config ./.config/webpack.config.prod.js';

  await execa(cmd, splitArgs(option), {
    env: {
      NODE_ENV: 'production',
    },
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+dts-bundle', async () => {
  const cmd = 'dts-bundle-generator';
  const option = '--no-banner dist/src/tjscli.d.ts -o dist/tjscli.d.ts';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('+webpack:dev', async () => {
  const cmd = 'webpack';
  const option = '--config ./.config/webpack.config.dev.js';

  await execa(cmd, splitArgs(option), {
    env: {
      NODE_ENV: 'production',
    },
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+pub:prod', async () => {
  const cmd = 'npm';
  const option = 'publish --registry https://registry.npmjs.org --access=public';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('+pub:prod:beta', async () => {
  const cmd = 'npm';
  const option = 'publish --registry https://registry.npmjs.org --access=public --tag beta';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('+pub:dev', async () => {
  const cmd = 'npm';
  const option = 'publish --registry http://localhost:8901 --force';

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('build', series('clean', '+build'));
task('dts-bundle', series('+dts-bundle', 'clean:dts'));
task('pub:prod:beta', series('clean', '+webpack:prod', '+dts-bundle', 'clean:dts', '+pub:prod:beta'));
task('pub:prod', series('clean', '+webpack:prod', '+dts-bundle', 'clean:dts', '+pub:prod'));
task('pub:dev', series('clean', '+webpack:dev', '+dts-bundle', 'clean:dts', '+pub:dev'));
task('webpack:dev', series('clean', '+webpack:dev', '+dts-bundle', 'clean:dts'));
task('webpack:prod', series('clean', '+webpack:prod', '+dts-bundle', 'clean:dts'));
