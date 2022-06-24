import fastGlob from 'fast-glob';
import { isNotEmpty } from 'my-easy-fp';
import { replaceSepToPosix } from 'my-node-fp';

export default async function fastGlobWrap(
  pattern: string | string[],
  options: Parameters<typeof fastGlob>[1],
  sep?: string,
) {
  const patterns = Array.isArray(pattern) ? pattern : [pattern];
  const unixifyPatterns = patterns.map((nonUnixifyPattern) => replaceSepToPosix(nonUnixifyPattern));
  const unixifyFiles = await fastGlob(unixifyPatterns, options);
  const files = isNotEmpty(sep) ? unixifyFiles.map((file) => file.replace(/\//g, sep)) : unixifyFiles;
  return files;
}
