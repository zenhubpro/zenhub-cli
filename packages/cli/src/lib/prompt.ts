import * as readline from 'readline';

export function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stderr });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export function promptSecret(question: string): Promise<string> {
  return new Promise((resolve) => {
    process.stderr.write(question);
    const stdin = process.stdin;

    if (!stdin.isTTY) {
      const rl = readline.createInterface({ input: stdin });
      rl.once('line', (line) => {
        rl.close();
        resolve(line.trim());
      });
      return;
    }

    const wasRaw = stdin.isRaw;
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');

    let input = '';
    const onData = (char: string) => {
      if (char === '\n' || char === '\r') {
        stdin.removeListener('data', onData);
        stdin.setRawMode(wasRaw ?? false);
        stdin.pause();
        process.stderr.write('\n');
        resolve(input);
      } else if (char === '') {
        process.stderr.write('\n');
        process.exit(0);
      } else if (char === '' || char === '\b') {
        if (input.length > 0) {
          input = input.slice(0, -1);
          process.stderr.write('\b \b');
        }
      } else {
        input += char;
        process.stderr.write('*');
      }
    };
    stdin.on('data', onData);
  });
}

export function openBrowser(url: string) {
  const { execSync } = require('child_process');
  try {
    if (process.platform === 'darwin') {
      execSync(`open "${url}"`);
    } else if (process.platform === 'win32') {
      execSync(`start "" "${url}"`);
    } else {
      execSync(`xdg-open "${url}"`);
    }
  } catch {
    // Silent fail — URL is printed
  }
}

export function promptSelect(question: string, options: string[]): Promise<number> {
  return prompt(question).then((answer) => {
    const idx = parseInt(answer) - 1;
    if (isNaN(idx) || idx < 0 || idx >= options.length) return -1;
    return idx;
  });
}
