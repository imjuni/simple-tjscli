export interface IMajor {
  /**
   * @minLength 2
   * @maxLength 255
   */
  name: string;

  /**
   * @maxLength 2048
   */
  desc?: string;
}
