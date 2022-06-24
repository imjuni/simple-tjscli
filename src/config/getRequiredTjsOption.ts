import ITjsOption from '@config/interfaces/ITjsOption';

export default function getRequiredTjsOption(
  originConfig: Partial<Omit<ITjsOption, 'cwd' | 'w' | 'config' | 'c' | 'project' | 'p'>> &
    Required<Pick<ITjsOption, 'cwd' | 'w' | 'config' | 'c' | 'project' | 'p'>>,
) {
  const option: ITjsOption = {
    generator: 'tjs',

    // ICommonOption + Required
    w: originConfig.cwd,
    cwd: originConfig.cwd,
    c: originConfig.config,
    config: originConfig.config,
    p: originConfig.project,
    project: originConfig.project,

    // ICommonOption + Required
    f: originConfig.files ?? [],
    files: originConfig.files ?? [],
    t: originConfig.types ?? [],
    types: originConfig.types ?? [],
    i: originConfig.interactive ?? false,
    interactive: originConfig.interactive ?? false,
    u: originConfig.outputType ?? 'json',
    outputType: originConfig.outputType ?? 'json',
    o: originConfig.output ?? undefined,
    output: originConfig.output ?? undefined,
    x: originConfig.prefix ?? undefined,
    prefix: originConfig.prefix ?? undefined,
    s: originConfig.sync ?? false,
    sync: originConfig.sync ?? false,
    b: originConfig.noBanner ?? false,
    noBanner: originConfig.noBanner ?? false,
    e: originConfig.e ?? '.ts',
    extName: originConfig.e ?? '.ts',
    watch: originConfig.watch ?? undefined,
    debounceTime: originConfig.debounceTime ?? 1000,

    // ITsjOption
    template: originConfig.template ?? undefined,
    templatePath: originConfig.template ?? undefined,
    overwrite: originConfig.overwrite ?? false,
    v: originConfig.verbose ?? false,
    verbose: originConfig.verbose ?? false,
  };

  return option;
}
