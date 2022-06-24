import ITjsOption from '@config/interfaces/ITjsOption';
import { parse } from 'jsonc-parser';
import minimist from 'minimist';
import { getDirnameSync } from 'my-node-fp';

export default function getCliTjsOption(
  configBuf: Buffer,
  argv: minimist.ParsedArgs,
  configFilePath: string,
  project: string,
) {
  const rawConfig = parse(configBuf.toString());
  const projectDirPath = getDirnameSync(project);

  const option: ITjsOption = {
    generator: 'tjs',

    // ICommonOption
    w: argv.w ?? argv.cwd ?? rawConfig.cwd ?? projectDirPath,
    cwd: argv.w ?? argv.cwd ?? rawConfig.cwd ?? projectDirPath,
    c: argv.c ?? argv.config ?? rawConfig.config ?? configFilePath,
    config: argv.c ?? argv.config ?? rawConfig.config ?? configFilePath,
    p: argv.p ?? argv.project ?? rawConfig.project ?? project,
    project: argv.p ?? argv.project ?? rawConfig.project ?? project,
    f: argv.f ?? argv.files ?? rawConfig.files ?? [],
    files: argv.f ?? argv.files ?? rawConfig.files ?? [],
    t: argv.t ?? argv.types ?? rawConfig.types ?? [],
    types: argv.t ?? argv.types ?? rawConfig.types ?? [],
    i: argv.i ?? argv.interactive ?? rawConfig.interactive ?? false,
    interactive: argv.i ?? argv.interactive ?? rawConfig.interactive ?? false,
    u: argv.u ?? argv.outputType ?? rawConfig.outputType ?? 'json',
    outputType: argv.u ?? argv.outputType ?? rawConfig.outputType ?? 'json',
    o: argv.o ?? argv.output ?? rawConfig.output ?? undefined,
    output: argv.o ?? argv.output ?? rawConfig.output ?? undefined,
    b: argv.b ?? argv.noBanner ?? rawConfig.noBanner ?? false,
    noBanner: argv.b ?? argv.noBanner ?? rawConfig.noBanner ?? false,
    e: argv.e ?? argv.extName ?? rawConfig.extName ?? '.ts',
    extName: argv.e ?? argv.extName ?? rawConfig.extName ?? '.ts',
    x: argv.x ?? argv.prefix ?? rawConfig.prefix ?? undefined,
    prefix: argv.x ?? argv.prefix ?? rawConfig.prefix ?? undefined,
    s: argv.s ?? argv.sync ?? rawConfig.sync ?? false,
    sync: argv.s ?? argv.sync ?? rawConfig.sync ?? false,
    template: argv.template ?? rawConfig.template ?? undefined,
    templatePath: argv.templatePath ?? rawConfig.templatePath ?? undefined,
    overwrite: argv.overwrite ?? rawConfig.overwrite ?? undefined,
    v: argv.v ?? argv.verbose ?? rawConfig.verbose ?? false,
    verbose: argv.v ?? argv.verbose ?? rawConfig.verbose ?? false,

    watch: argv.watch ?? rawConfig.watch ?? undefined,
    debounceTime: argv.debounceTime ?? rawConfig.debounceTime ?? 1000,

    // ITsjOption
  };

  return option;
}
