import { CliConfig } from './config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export class ZenHubClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: CliConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.apiUrl.replace(/\/+$/, '');
  }

  async request<T = any>(
    method: string,
    path: string,
    body?: any,
    query?: Record<string, string | number | undefined>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
    };

    const options: RequestInit = { method, headers };
    if (body && method !== 'GET') {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), options);
    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      return {
        success: false,
        error: `HTTP ${res.status} — unexpected response (${contentType || 'no content-type'})`,
      };
    }

    const json = await res.json() as any;

    if (!res.ok) {
      return {
        success: false,
        error: json.message || json.error || `HTTP ${res.status}`,
      };
    }

    return json;
  }

  async get<T = any>(path: string, query?: Record<string, string | number | undefined>) {
    return this.request<T>('GET', path, undefined, query);
  }

  async post<T = any>(path: string, body?: any) {
    return this.request<T>('POST', path, body);
  }

  async patch<T = any>(path: string, body?: any) {
    return this.request<T>('PATCH', path, body);
  }

  async del<T = any>(path: string) {
    return this.request<T>('DELETE', path);
  }
}
