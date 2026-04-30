# zenhub-mcp

MCP server (stdio) for ZenHub. Exposes 50+ tools spanning campaigns, schedules, groups, messages, ZenChat conversations, contacts, connections, stats, access-list, blacklist, and buyers ingestion.

Compatible with any MCP client that supports stdio transport: Claude Desktop, Claude Code, Codex CLI, Cursor, GitHub Copilot (VS Code MCP), Continue, etc.

## Install

```bash
npm install -g zenhub-mcp
# or run on demand
npx zenhub-mcp
```

Requires **Node 18+** and a ZenHub API key (`agwpp_live_*`).

## Auth

Set `ZENHUB_API_KEY` in the env. Optionally override `ZENHUB_API_URL` (defaults to `https://api.zenhub.pro/api`).

```bash
export ZENHUB_API_KEY=agwpp_live_xxxxxxxxxxxxxxxx
```

## Client setup

### Claude Desktop

Edit `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "zenhub": {
      "command": "npx",
      "args": ["-y", "zenhub-mcp"],
      "env": { "ZENHUB_API_KEY": "agwpp_live_..." }
    }
  }
}
```

### Claude Code

```bash
claude mcp add zenhub -- npx -y zenhub-mcp
```

Or in `~/.claude.json`:

```json
{
  "mcpServers": {
    "zenhub": {
      "command": "npx",
      "args": ["-y", "zenhub-mcp"],
      "env": { "ZENHUB_API_KEY": "agwpp_live_..." }
    }
  }
}
```

### Codex CLI

Edit `~/.codex/config.toml`:

```toml
[mcp_servers.zenhub]
command = "npx"
args = ["-y", "zenhub-mcp"]
env = { ZENHUB_API_KEY = "agwpp_live_..." }
```

### Cursor

Edit `.cursor/mcp.json` (project) or `~/.cursor/mcp.json` (global):

```json
{
  "mcpServers": {
    "zenhub": {
      "command": "npx",
      "args": ["-y", "zenhub-mcp"],
      "env": { "ZENHUB_API_KEY": "agwpp_live_..." }
    }
  }
}
```

### VS Code (Copilot / Continue)

Edit `.vscode/mcp.json`:

```json
{
  "servers": {
    "zenhub": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "zenhub-mcp"],
      "env": { "ZENHUB_API_KEY": "agwpp_live_..." }
    }
  }
}
```

## Smoke test

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | ZENHUB_API_KEY=$ZENHUB_API_KEY npx zenhub-mcp
```

Should emit a JSON list of all available tools.

## Tools (~58)

| Category | Tools |
|---|---|
| campaigns | list, get, create, update, delete, stats, execute |
| groups | list, get, members, create, add_member, remove_member, sync_members, import, remove_from_campaign, campaigns_members |
| schedules | list, get, create, update, delete, retry, plus campaign_schedules_* (6) |
| messages | send, send_to_campaigns, bulk |
| conversations | list, get, messages, reply |
| contacts | list, get, create, update, delete |
| connections | list, get |
| stats | dashboard, campaign |
| access-list | list, grant, bulk_grant, check, renew, revoke, stats |
| blacklist | list, check, add, bulk_add, remove |
| buyers | add, public_ping |

Run `tools/list` against the server for the canonical list with full schemas.

## Development

```bash
# from monorepo root
npm install
npm run build
npm run gen:openapi   # regenerate coverage report from prod /api/docs-json
```

The single source of truth for tool definitions is [`packages/tools/src/tools/`](../tools/src/tools/). The codegen script in `packages/tools/scripts/generate.ts` cross-checks tool coverage against the live OpenAPI spec.

## License

MIT
