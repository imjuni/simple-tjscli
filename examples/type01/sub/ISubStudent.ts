import type { ICollege } from '../ICollege';
import type { IMajor } from '../IMajor';
import type { IProfessor } from '../IProfessor';

export default interface ISubStudent {
  /**
   * @minLength 2
   * @maxLength 245
   */
  name: string;

  major: IMajor[];

  projessor: IProfessor['name'];
  college: ICollege['name'];
}
