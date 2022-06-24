import getCliTjsOption from '@config/getCliTjsOption';
import getCliTsjOption from '@config/getCliTsjOption';
import consola from 'consola';
import findUp from 'find-up';
import fs from 'fs';
import minimist from 'minimist';
import { isEmpty, isFalse, isNotEmpty } from 'my-easy-fp';
import { existsSync, getDirnameSync } from 'my-node-fp';

export default function preLoadConfig() {
  try {
    const argv = minimist([...process.argv.slice(2)]);
    const cwd = process.cwd();

    const configFilePath =
      isNotEmpty(argv.config) || isNotEmpty(argv.c) ? findUp.sync([argv.config, argv.c]) : findUp.sync('.tjsclirc');

    const tsconfigPath =
      isNotEmpty(argv.project) || isNotEmpty(argv.p)
        ? findUp.sync([argv.project, argv.p], { cwd })
        : findUp.sync('tsconfig.json', { cwd });

    if (isEmpty(configFilePath) || isFalse(existsSync(configFilePath))) {
      const tsconfigDirPath = getDirnameSync(tsconfigPath ?? 'tsconfig.json');

      return {
        p: tsconfigPath,
        project: tsconfigPath,
        w: tsconfigDirPath,
        cwd: tsconfigDirPath,
        c: undefined,
        config: undefined,
      };
    }

    if (isEmpty(tsconfigPath) || isFalse(existsSync(tsconfigPath))) {
      return {};
    }

    const [command] = argv._;

    const configBuf = fs.readFileSync(configFilePath);

    if (command === 'tsj') {
      return getCliTsjOption(configBuf, argv, configFilePath, tsconfigPath);
    }

    if (command === 'tsj-w') {
      return getCliTsjOption(configBuf, argv, configFilePath, tsconfigPath);
    }

    if (command === 'tjs') {
      return getCliTjsOption(configBuf, argv, configFilePath, tsconfigPath);
    }

    return {};
  } catch (catched) {
    const err = catched instanceof Error ? catched : new Error('unknown error raised');
    consola.error(err);

    return {};
  }
}
