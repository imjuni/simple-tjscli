import { isNotEmpty } from 'my-easy-fp';
import ora from 'ora';

const spinner = ora('');

let isMessageDisplay = false;

export function enable(flag: boolean) {
  isMessageDisplay = flag;
}

export function update(message: string) {
  if (isMessageDisplay) {
    spinner.text = message;
  }
}

export function start(message?: string) {
  if (isMessageDisplay) {
    if (isNotEmpty(message)) {
      spinner.text = message;
    }

    if (spinner.isSpinning) {
      update(message ?? '');
    } else {
      spinner.start(message);
    }
  }
}

export function stop() {
  spinner.stopAndPersist();
}
