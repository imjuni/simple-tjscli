import type { ICollege } from './ICollege';
import type { IMajor } from './IMajor';

export interface IProfessor {
  /**
   * @minLength 2
   * @maxLength 255
   */
  name: string;

  major: IMajor;

  college: ICollege;
}
