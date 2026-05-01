# ZenHub CLI

A command-line interface for the [ZenHub](https://www.zenhub.pro) platform. Manage WhatsApp campaigns, groups, schedules, contacts, conversations, and more — directly from your terminal or through AI agents.

Built for humans and machines. Every command supports `--json` output for seamless integration with AI coding assistants (Claude Code, Codex, Copilot, OpenClaw) and shell scripts.

This repo is a **monorepo** (npm workspaces):

| Package | Purpose | Bin |
|---|---|---|
| [`zenhub-cli`](packages/cli) | Terminal CLI (Commander) | `zenhub`, `zenhub-cli` |
| [`zenhub-mcp`](packages/mcp-stdio) | MCP server (stdio) for Claude Desktop, Codex, Cursor, Copilot | `zenhub-mcp` |
| [`@zenhub/tools`](packages/tools) | Tool definitions (Zod) shared by CLI + MCP | — |
| [`@zenhub/client`](packages/client) | HTTP client + auth helpers | — |

See [packages/mcp-stdio/README.md](packages/mcp-stdio/README.md) for MCP setup snippets per client.

---

## ⚡ Setup automatizado (1 linha — peça pra IA fazer)

Cole isso no seu **Claude Desktop / Claude Code / Cursor / Codex / VS Code**:

```
Configure o ZenHub MCP no meu cliente seguindo as instrucoes em
https://github.com/zenhubpro/zenhub-cli/blob/main/AGENT.md
```

A IA le o [AGENT.md](AGENT.md), pergunta seu cliente + API key, edita o config file certo, e te avisa pra reiniciar o app. ~30 segundos.

Se preferir fazer manual, pule pra [Setup manual por cliente](#setup-manual-por-cliente).

---

## Setup manual por cliente

### Pre-requisitos

1. Node.js 18+
2. API key ZenHub (`agwpp_live_...`) — gere em https://www.zenhub.pro/settings/integrations

### Claude Desktop

`~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) ou `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

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

Reinicie o Claude Desktop.

### Claude Code

```bash
claude mcp add zenhub --env ZENHUB_API_KEY=agwpp_live_... -- npx -y zenhub-mcp
```

### Codex CLI

`~/.codex/config.toml`:

```toml
[mcp_servers.zenhub]
command = "npx"
args = ["-y", "zenhub-mcp"]
env = { ZENHUB_API_KEY = "agwpp_live_..." }
```

### Cursor

`.cursor/mcp.json` (projeto) ou `~/.cursor/mcp.json` (global):

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

`.vscode/mcp.json`:

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

### Verificacao

Pergunte na IA: *"Liste minhas campanhas via ZenHub MCP"*. A IA invoca `campaigns_list` e retorna seus dados.

---

## Overview

```
zenhub <command> <subcommand> [flags]
```

**45+ commands** across **10 command groups:**

| Group | Description |
|-------|-------------|
| [`campaigns`](#campaigns) | Create, list, update, delete, execute campaigns and view stats |
| [`groups`](#groups) | Manage WhatsApp groups, members, and sync |
| [`schedules`](#schedules) | Schedule messages for future delivery |
| [`messages`](#messages) | Send messages to groups, campaigns, or in bulk |
| [`conversations`](#conversations--chat) | List and reply to ZenChat conversations |
| [`contacts`](#contacts) | Manage ZenChat contacts and tags |
| [`connections`](#connections) | View WhatsApp connection status |
| [`stats`](#stats) | Dashboard analytics and campaign metrics |
| [`access-list`](#access-list) | Manage campaign access lists (whitelist) |
| [`blacklist`](#blacklist) | Block and unblock phone numbers |

## Quick Start

```bash
# Install
npm install -g zenhub-cli

# Authenticate (opens browser)
zenhub login

# You're ready
zenhub campaigns list
zenhub chat list --status open
zenhub stats dashboard
```

## Installation

### npm (recommended)

```bash
npm install -g zenhub-cli
```

### From source

```bash
git clone https://github.com/zenhubpro/zenhub-cli.git
cd zenhub-cli
npm install
npm run build
npm link
```

**Requirements:** Node.js 18 or later.

## Authentication

ZenHub CLI supports two authentication methods.

### Device auth flow (recommended)

```bash
zenhub login
```

This opens your browser to the ZenHub login page. Sign in, select your organization, and the CLI automatically receives credentials. Works on headless servers too — just open the provided URL on any device.

Credentials are stored in `~/.zenhub/credentials.json`.

```bash
# Check current auth status
zenhub status

# Same as above
zenhub whoami

# Clear stored credentials
zenhub logout
```

### API key (environment variable)

For CI/CD pipelines or environments where browser auth is not practical:

```bash
export ZENHUB_API_KEY=agwpp_live_xxxxxxxxxxxxxxxx
```

When `ZENHUB_API_KEY` is set, the CLI uses it automatically. The device auth credentials are used as a fallback if the environment variable is not set.

### Custom endpoints

```bash
zenhub login --api-url https://your-api.example.com/api --web-url https://your-app.example.com
```

## Commands

All commands accept the `--json` flag for structured output. Without it, output is formatted as human-readable tables and summaries.

---

### Campaigns

Manage WhatsApp campaigns — create, configure, execute, and track performance.

```bash
# List all campaigns
zenhub campaigns list

# Get campaign details
zenhub campaigns get <id>

# Create a new campaign
zenhub campaigns create --name "Launch Campaign" --connection <connection_id>

# Update a campaign
zenhub campaigns update <id> --name "Updated Name"

# Delete a campaign
zenhub campaigns delete <id>

# View campaign statistics
zenhub campaigns stats <id>

# Execute a campaign
zenhub campaigns execute <id>
```

---

### Groups

Manage WhatsApp groups within campaigns — create groups, add/remove members, and sync.

```bash
# List groups in a campaign
zenhub groups list --campaign <campaign_id>

# Get group details
zenhub groups get <id>

# Create a new group
zenhub groups create <campaign_id> --name "VIP Members"

# List group members
zenhub groups members <campaign_id> <group_id>

# Add a member
zenhub groups add-member <campaign_id> <group_id> --phone 5511999999999

# Remove a member
zenhub groups remove-member <campaign_id> <group_id> <phone>

# Sync members from WhatsApp
zenhub groups sync-members <campaign_id>
```

---

### Schedules

Schedule messages for future delivery to campaign groups.

```bash
# List schedules
zenhub schedules list

# Get schedule details
zenhub schedules get <id>

# Create a scheduled message
zenhub schedules create \
  --campaign <campaign_id> \
  --message "Good morning! Here's today's update." \
  --date "2026-03-25T10:00:00"

# Update a schedule
zenhub schedules update <id> --message "Updated message content"

# Delete a schedule
zenhub schedules delete <id>
```

---

### Messages

Send messages immediately — to a single group, multiple campaigns, or in bulk.

```bash
# Send to a specific group
zenhub messages send --group <group_id> --message "Hello everyone!"

# Send to all groups in one or more campaigns
zenhub messages send-to-campaigns --campaigns <id1>,<id2> --message "Campaign broadcast"

# Bulk send
zenhub messages bulk --file messages.json
```

---

### Conversations / Chat

Interact with ZenChat conversations. The `conversations` command is aliased as `chat` for convenience.

```bash
# List conversations (filter by status)
zenhub chat list
zenhub chat list --status open
zenhub chat list --status pending

# Get conversation details
zenhub chat get <id>

# View messages in a conversation
zenhub chat messages <id>

# Reply to a conversation
zenhub chat reply <id> --message "Thanks for reaching out!"
```

---

### Contacts

Manage ZenChat contacts — create, update, delete, and organize with tags.

```bash
# List contacts
zenhub contacts list

# Get contact details
zenhub contacts get <id>

# Create a contact
zenhub contacts create --name "Jane Doe" --phone 5511999999999

# Update a contact
zenhub contacts update <id> --name "Jane Smith"

# Delete a contact
zenhub contacts delete <id>
```

---

### Connections

View and inspect WhatsApp connections linked to your organization.

```bash
# List all connections
zenhub connections list

# Get connection details and status
zenhub connections get <id>
```

---

### Stats

View dashboard analytics and campaign-level metrics.

```bash
# Organization dashboard
zenhub stats dashboard

# Campaign-specific stats
zenhub stats campaign <id>
```

---

### Access List

Manage per-campaign access lists (whitelists). Control who can join campaign groups.

```bash
# List access entries
zenhub acl list <campaign_id>

# Grant access
zenhub acl grant <campaign_id> --phone 5511999999999

# Check if a phone has access
zenhub acl check <campaign_id> <phone>

# Renew access
zenhub acl renew <campaign_id>

# Revoke access
zenhub acl revoke <campaign_id> <phone>

# View access list stats
zenhub acl stats <campaign_id>
```

> `access-list` and `acl` are interchangeable.

---

### Blacklist

Manage blocked phone numbers at the organization level.

```bash
# List blocked numbers
zenhub blacklist list

# Check if a number is blocked
zenhub blacklist check <phone>

# Block a number
zenhub blacklist add --phone 5511999999999

# Unblock a number
zenhub blacklist remove <id>
```

## AI Integration

ZenHub CLI is designed to work with any AI assistant that can run terminal commands. Pass `--json` to get structured output that AI models parse natively.

### Claude Code

```bash
# Claude Code can run these directly:
zenhub campaigns list --json
zenhub chat list --status open --json
zenhub stats dashboard --json
```

### Example: AI-driven workflow

```bash
# 1. AI checks open conversations
zenhub chat list --status pending --json

# 2. AI reads the messages
zenhub chat messages <conversation_id> --json

# 3. AI composes and sends a reply
zenhub chat reply <conversation_id> --message "Here's the info you requested..." --json

# 4. AI verifies delivery
zenhub chat get <conversation_id> --json
```

### Headless / VPS usage

The device auth flow works on servers without a display. When `zenhub login` cannot open a browser, it prints a URL. Open that URL on any device (phone, laptop) to complete authentication. The CLI polls and picks up the credentials automatically.

```
$ zenhub login

  ZenHub CLI — Login
  ─────────────────

  Code: AB12CD

  Opening browser...
  Or visit: https://www.zenhub.pro/cli-auth?session=xxx

  Waiting for authorization...
```

## Configuration

### Credential storage

After `zenhub login`, credentials are saved to:

```
~/.zenhub/credentials.json
```

This file contains your API key, user info, and selected organization. Run `zenhub logout` to clear it.

### Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ZENHUB_API_KEY` | API key for authentication (overrides stored credentials) | — |
| `ZENHUB_API_URL` | API base URL | `https://api.zenhub.pro/api` |

### Output modes

| Flag | Behavior |
|------|----------|
| (none) | Human-readable tables and formatted text |
| `--json` | Raw JSON — for scripts, pipes, and AI agents |

## Contributing

```bash
# Clone the repo
git clone https://github.com/zenhubpro/zenhub-cli.git
cd zenhub-cli

# Install dependencies
npm install

# Run in development
npm run dev -- campaigns list

# Build
npm run build

# Lint
npm run lint
```

### Project structure

```
src/
├── index.ts              # Entry point, command registration
├── commands/
│   ├── auth.ts           # login, logout, status/whoami
│   ├── campaigns.ts      # Campaign CRUD + stats + execute
│   ├── groups.ts         # Group management + members
│   ├── schedules.ts      # Schedule CRUD
│   ├── messages.ts       # send, bulk, send-to-campaigns
│   ├── conversations.ts  # ZenChat conversations + reply
│   ├── contacts.ts       # Contact CRUD
│   ├── connections.ts    # WhatsApp connections
│   ├── stats.ts          # Dashboard + campaign analytics
│   ├── access-list.ts    # Access list management
│   └── blacklist.ts      # Blocked numbers
└── lib/
    ├── client.ts         # HTTP client (ZenHubClient)
    ├── config.ts         # Config loading
    ├── auth.ts           # Credential storage + browser open
    └── output.ts         # JSON/table output formatting
```

## License

MIT
