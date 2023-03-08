import type ICommonOption from '#config/interfaces/ICommonOption';

/**
 * TypeScript JSONSchema generator Option
 */
export default interface ITjsOption extends ICommonOption {
  /**
   * engine
   *
   * * tjs TypeScript JSONSchema: https://github.com/YousefED/typescript-json-schema
   */
  generator: 'tjs';
}
