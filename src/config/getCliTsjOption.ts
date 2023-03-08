import type ITsjOption from '#config/interfaces/ITsjOption';
import getWorkingDirectory from '#modules/getWorkingDirectory';
import { parse } from 'jsonc-parser';
import type minimist from 'minimist';

export default function getCliTjsOption(
  configBuf: Buffer,
  argv: minimist.ParsedArgs,
  configFilePath: string,
  project: string,
) {
  const rawConfig = parse(configBuf.toString());

  const option: ITsjOption = {
    generator: 'tsj',

    // ICommonOption
    w: argv.w ?? argv.cwd ?? rawConfig.cwd ?? getWorkingDirectory(argv.w ?? argv.cwd ?? rawConfig.cwd),
    cwd: argv.w ?? argv.cwd ?? rawConfig.cwd ?? getWorkingDirectory(argv.w ?? argv.cwd ?? rawConfig.cwd),
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
    template: argv.template ?? rawConfig.template ?? undefined,
    templatePath: argv.templatePath ?? rawConfig.templatePath ?? undefined,
    skipError: argv.skipError ?? rawConfig.skipError ?? false,
    overwrite: argv.overwrite ?? rawConfig.overwrite ?? undefined,
    v: argv.v ?? argv.verbose ?? rawConfig.verbose ?? false,
    verbose: argv.v ?? argv.verbose ?? rawConfig.verbose ?? false,
    s: argv.s ?? argv.sync ?? rawConfig.sync ?? false,
    sync: argv.s ?? argv.sync ?? rawConfig.sync ?? false,
    watch: argv.watch ?? rawConfig.watch ?? undefined,
    debounceTime: argv.debounceTime ?? rawConfig.debounceTime ?? 1000,

    // ITsjOption
    seperateDefinitions: argv.seperateDefinitions ?? rawConfig.seperateDefinitions ?? false,
    skipTypeCheck: argv.skipTypeCheck ?? rawConfig.skipTypeCheck ?? true,
    topRef: argv.topRef ?? rawConfig.topRef ?? false,
    expose: argv.expose ?? rawConfig.expose ?? 'none',
    jsDoc: argv.jsDoc ?? rawConfig.jsDoc ?? 'extended',
    extraTags: argv.extraTags ?? rawConfig.extraTags ?? [],
    additionalProperties: argv.additionalProperties ?? rawConfig.additionalProperties ?? true,
  };

  return option;
}
