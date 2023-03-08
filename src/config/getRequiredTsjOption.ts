import type ITsjOption from '#config/interfaces/ITsjOption';

export default function getRequiredTsjOption(
  originConfig: Partial<Omit<ITsjOption, 'cwd' | 'w' | 'config' | 'c' | 'project' | 'p'>> &
    Required<Pick<ITsjOption, 'cwd' | 'w' | 'config' | 'c' | 'project' | 'p'>>,
) {
  const option: ITsjOption = {
    generator: 'tsj',

    // ICommonOption + Required
    w: originConfig.cwd,
    cwd: originConfig.cwd,
    c: originConfig.config,
    config: originConfig.config,
    p: originConfig.project,
    project: originConfig.project,

    // ICommonOption + Nullable
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

    template: originConfig.template ?? undefined,
    templatePath: originConfig.template ?? undefined,
    overwrite: originConfig.overwrite ?? false,
    v: originConfig.verbose ?? false,
    verbose: originConfig.verbose ?? false,
    b: originConfig.noBanner ?? false,
    noBanner: originConfig.noBanner ?? false,
    e: originConfig.extName ?? '.ts',
    extName: originConfig.extName ?? '.ts',
    watch: originConfig.watch ?? undefined,
    debounceTime: originConfig.debounceTime ?? 1000,
    skipError: originConfig.skipError ?? false,

    // ITsjOption
    seperateDefinitions: originConfig.seperateDefinitions ?? false,
    skipTypeCheck: originConfig.skipTypeCheck ?? true,
    topRef: originConfig.topRef ?? false,
    expose: originConfig.expose ?? 'none',
    jsDoc: originConfig.jsDoc ?? 'extended',
    extraTags: originConfig.extraTags ?? [],
    additionalProperties: originConfig.additionalProperties ?? true,
  };

  return option;
}
