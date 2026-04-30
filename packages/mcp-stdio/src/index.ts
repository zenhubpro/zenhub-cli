#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { ZenHubClient, getApiKey, getApiUrl } from '@zenhub/client';
import { allTools } from '@zenhub/tools';

function buildClient(): ZenHubClient {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'ZENHUB_API_KEY environment variable is required, or run `zenhub login` first.',
    );
  }
  return new ZenHubClient({ apiKey, apiUrl: getApiUrl() });
}

let _client: ZenHubClient | null = null;
function client() {
  if (!_client) _client = buildClient();
  return _client;
}

async function wrap(fn: () => Promise<unknown>) {
  try {
    const res = await fn();
    return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
  } catch (err: any) {
    return {
      content: [{ type: 'text' as const, text: JSON.stringify({ error: err.message }, null, 2) }],
    };
  }
}

const server = new McpServer({ name: 'zenhub', version: '0.2.0' });

for (const tool of allTools) {
  server.tool(
    tool.name,
    tool.description,
    tool.schema,
    async (args: Record<string, unknown>) =>
      wrap(() => tool.handler(client(), args as never) as Promise<unknown>),
  );
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
