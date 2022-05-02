import type { ICollege } from './ICollege';
import type { IMajor } from './IMajor';
import type { IProfessor } from './IProfessor';

export interface IStudent {
  /**
   * @minLength 2
   * @maxLength 255
   */
  name: string;

  major: IMajor[];

  projessor: IProfessor['name'];
  college: ICollege['name'];
}
