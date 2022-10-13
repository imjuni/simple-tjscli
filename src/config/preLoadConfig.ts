import getCliTjsOption from '@config/getCliTjsOption';
import getCliTsjOption from '@config/getCliTsjOption';
import consola from 'consola';
import findUp from 'find-up';
import fs from 'fs';
import minimist from 'minimist';
import { existsSync, getDirnameSync } from 'my-node-fp';

export default function preLoadConfig() {
  try {
    const argv = minimist([...process.argv.slice(2)]);
    const cwd = process.cwd();

    const configFilePath =
      argv.config != null || argv.c != null ? findUp.sync([argv.config, argv.c]) : findUp.sync('.tjsclirc');

    const tsconfigPath =
      argv.project != null || argv.p != null
        ? findUp.sync([argv.project, argv.p], { cwd })
        : findUp.sync('tsconfig.json', { cwd });

    if (configFilePath == null || existsSync(configFilePath) === false) {
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

    if (tsconfigPath == null || existsSync(tsconfigPath) === false) {
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
