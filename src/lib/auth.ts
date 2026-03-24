import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as readline from 'readline';

const CONFIG_DIR = path.join(os.homedir(), '.zenhub');
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'credentials.json');

export interface Credentials {
  api_key: string;
  api_url: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
  organization_id?: string;
  organization_name?: string;
  logged_in_at: string;
}

function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 });
  }
}

export function saveCredentials(creds: Credentials) {
  ensureConfigDir();
  fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), { mode: 0o600 });
}

export function loadCredentials(): Credentials | null {
  if (!fs.existsSync(CREDENTIALS_FILE)) return null;
  try {
    const data = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function clearCredentials() {
  if (fs.existsSync(CREDENTIALS_FILE)) {
    fs.unlinkSync(CREDENTIALS_FILE);
  }
}

export function getApiKey(): string | null {
  if (process.env.ZENHUB_API_KEY) return process.env.ZENHUB_API_KEY;
  const creds = loadCredentials();
  return creds?.api_key || null;
}

export function getApiUrl(): string {
  if (process.env.ZENHUB_API_URL) return process.env.ZENHUB_API_URL;
  const creds = loadCredentials();
  return creds?.api_url || 'https://api.zenhub.pro/api';
}

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
      // Non-interactive: read line normally
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
      } else if (char === '\u0003') {
        process.stderr.write('\n');
        process.exit(0);
      } else if (char === '\u007F' || char === '\b') {
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

export function promptSelect(question: string, options: string[]): Promise<number> {
  return prompt(question).then((answer) => {
    const idx = parseInt(answer) - 1;
    if (isNaN(idx) || idx < 0 || idx >= options.length) return -1;
    return idx;
  });
}
