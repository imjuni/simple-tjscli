import ITjsOption from '@config/interfaces/ITjsOption';
import ITsjOption from '@config/interfaces/ITsjOption';
import { Argv } from 'yargs';

export default function watchBuilder<T extends ITjsOption | ITsjOption>(args: Argv<T>) {
  args
    .option('watch', {
      describe: 'watching directory',
      type: 'string',
    })
    .option('debounceTime', {
      describe: 'watching debounce time',
      type: 'number',
    });

  return args;
}
