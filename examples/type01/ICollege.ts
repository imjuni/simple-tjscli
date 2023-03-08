import type { IProfessor } from './IProfessor';

export interface ICollege {
  /**
   * @minLength 2
   * @maxLength 255
   */
  name: string;

  /**
   * @minLength 64
   * @maxLength 1024
   */
  address: string;

  professors: IProfessor[];
}
