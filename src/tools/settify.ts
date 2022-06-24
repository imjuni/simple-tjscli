/** create set, dedupe duplicated element after return array type */
export default function settify<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
