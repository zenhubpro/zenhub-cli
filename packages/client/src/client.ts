export interface ZenHubClientConfig {
  apiKey: string;
  apiUrl?: string;
}

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

const DEFAULT_API_URL = 'https://api.zenhub.pro/api';

export class ZenHubClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(config: ZenHubClientConfig) {
    if (!config.apiKey) {
      throw new Error('ZenHubClient: apiKey is required');
    }
    this.apiKey = config.apiKey;
    this.baseUrl = (config.apiUrl ?? DEFAULT_API_URL).replace(/\/+$/, '');
  }

  async request<T = any>(
    method: string,
    path: string,
    body?: any,
    query?: Record<string, string | number | boolean | undefined | null>,
  ): Promise<ApiResponse<T>> {
    const url = new URL(`${this.baseUrl}${path}`);

    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const headers: Record<string, string> = {
      'x-api-key': this.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'zenhub-client/0.1.0',
    };

    const options: RequestInit = { method, headers };
    if (body && method !== 'GET' && method !== 'HEAD') {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url.toString(), options);
    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      return {
        success: false,
        error: `HTTP ${res.status} — unexpected response (${contentType || 'no content-type'})${text ? `: ${text.slice(0, 200)}` : ''}`,
      };
    }

    const json = (await res.json()) as any;

    if (!res.ok) {
      return {
        success: false,
        error: json.message || json.error || `HTTP ${res.status}`,
      };
    }

    return json;
  }

  get<T = any>(path: string, query?: Record<string, string | number | boolean | undefined | null>) {
    return this.request<T>('GET', path, undefined, query);
  }

  post<T = any>(path: string, body?: any) {
    return this.request<T>('POST', path, body);
  }

  patch<T = any>(path: string, body?: any) {
    return this.request<T>('PATCH', path, body);
  }

  put<T = any>(path: string, body?: any) {
    return this.request<T>('PUT', path, body);
  }

  del<T = any>(path: string) {
    return this.request<T>('DELETE', path);
  }
}
