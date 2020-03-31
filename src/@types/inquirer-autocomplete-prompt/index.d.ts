declare module 'inquirer-autocomplete-prompt' {
  import inquirer from 'inquirer';
  import base from 'inquirer/lib/prompts/base';
  import * as readLine from 'readline';

  /**
   * The question-options for the `InputPrompt<T>`.
   */
  type Question = inquirer.InputQuestionOptions<inquirer.Answers>;

  // class InputPrompt<TQuestion extends Question = Question> extends Prompt<TQuestion>
  class AutocompletePrompt<TQuestion extends Question = Question> extends base<TQuestion> {
    constructor(
      question: any,
      readLine: readLine.Interface /*: readline$Interface */,
      answers: inquirer.Answers /*: Array<any> */,
    );
  }

  export = AutocompletePrompt;
}
