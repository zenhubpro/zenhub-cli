import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const CONFIG_DIR = path.join(os.homedir(), '.zenhub');
const CREDENTIALS_FILE = path.join(CONFIG_DIR, 'credentials.json');
const DEFAULT_API_URL = 'https://api.zenhub.pro/api';

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
    return JSON.parse(fs.readFileSync(CREDENTIALS_FILE, 'utf-8'));
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
  return creds?.api_url || DEFAULT_API_URL;
}
