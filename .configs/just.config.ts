/* eslint-disable import/no-extraneous-dependencies */
import execa from 'execa';
import { logger, series, task } from 'just-task';

function splitArgs(args: string): string[] {
  return args
    .split(' ')
    .map((arg) => arg.trim())
    .filter((arg) => arg != '');
}

task('clean', async () => {
  const cmd = 'rimraf';
  const option = 'dist artifact';

  logger.info('clean: ', cmd, option);

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('+build', async () => {
  const cmd = 'tsc';
  const option = '-p tsconfig.json --incremental';

  logger.info('+build: ', cmd, option);

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('debug', async () => {
  const cmd = 'node';
  const option = '-r ts-node/register --inspect-brk --nolazy src/cli.ts';

  logger.info('+debug: ', cmd, option);

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('lint', async () => {
  const cmd = 'eslint';
  const option = '--cache --cache-strategy content .';

  logger.info('lint: ', cmd, option);

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('+rollup:dev', async () => {
  const cmd = 'rollup';
  const option = '--config ./.configs/rollup.config.dev.ts --configPlugin ts';

  logger.info('+rollup:dev: ', cmd, option);

  await execa(cmd, splitArgs(option), {
    env: {
      NODE_ENV: 'production',
    },
    stderr: process.stderr,
    stdout: process.stdout,
  });
});

task('+rollup:prod', async () => {
  const cmd = 'rollup';
  const option = '--config ./.configs/rollup.config.prod.ts --configPlugin ts';

  logger.info('+rollup:prod: ', cmd, option);

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

  logger.info('+pub:prod: ', cmd, option);

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('+pub:dev', async () => {
  const cmd = 'npm';
  const option = 'publish --registry http://localhost:8901 --force';

  logger.info('+pub:dev: ', cmd, option);

  await execa(cmd, splitArgs(option), { stderr: process.stderr, stdout: process.stdout });
});

task('build', series('clean', '+build'));
task('pub:prod', series('clean', '+rollup:prod', '+pub:prod'));
task('pub:dev', series('clean', '+rollup:dev', '+pub:dev'));
task('rollup:dev', series('clean', '+rollup:dev'));
task('rollup:prod', series('clean', '+rollup:prod'));
