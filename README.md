# ZenHub CLI + MCP

A command-line interface and MCP server for the [ZenHub](https://www.zenhub.pro) platform. Manage WhatsApp campaigns, groups, schedules, contacts, ZenChat conversations, and more — from your terminal or directly through AI agents (Claude Desktop, Claude Code, Cursor, Codex CLI, GitHub Copilot, Continue, etc).

Built for humans **and** AI agents. Every CLI command supports `--json`. The MCP server exposes ~50 typed tools that any MCP-compatible AI client can call natively.

---

## 🤖 Instructions for AI agents (read this first)

> **You are an AI agent (Claude, Codex, Copilot, Cursor, etc) and the user shared this repository asking you to set up ZenHub. Follow the steps below exactly. Do not skip ahead.**

### Step 1 — Identify the user's AI client

Ask: **"Which app are you using right now? (Claude Desktop, Claude Code, Cursor, Codex CLI, VS Code, or other?)"**

If you (the agent) **are** running inside one of these clients, you already know — skip the question and proceed.

### Step 2 — Get the API key

Ask: **"What is your ZenHub API key? (format `agwpp_live_...`)"**

If the user does not have one, instruct:

> 1. Open https://www.zenhub.pro/settings/integrations
> 2. Click **"New key"**
> 3. Set name (e.g. "Claude MCP") and scope `write`
> 4. Copy the generated key (only shown once)

### Step 3 — Locate the config file for the user's client

| Client | Config file path | Format |
|---|---|---|
| Claude Desktop (macOS) | `~/Library/Application Support/Claude/claude_desktop_config.json` | JSON |
| Claude Desktop (Windows) | `%APPDATA%\Claude\claude_desktop_config.json` | JSON |
| Claude Desktop (Linux) | `~/.config/Claude/claude_desktop_config.json` | JSON |
| Claude Code | `~/.claude.json` (or use `claude mcp add`) | JSON |
| Cursor (global) | `~/.cursor/mcp.json` | JSON |
| Cursor (project) | `.cursor/mcp.json` in cwd | JSON |
| Codex CLI | `~/.codex/config.toml` | TOML |
| VS Code (Copilot/Continue) | `.vscode/mcp.json` in cwd | JSON |

If the file does not exist yet, **create it** with the content below. If it already exists, **merge** the `mcpServers` key (or `servers` for VS Code, `[mcp_servers.zenhub]` for Codex TOML), preserving existing entries. **Show the user the diff before saving.**

### Step 4 — Apply the config

#### Claude Desktop / Claude Code / Cursor (JSON)

Add inside `mcpServers`:

```json
"zenhub": {
  "command": "npx",
  "args": ["-y", "zenhub-mcp"],
  "env": { "ZENHUB_API_KEY": "PASTE_API_KEY_HERE" }
}
```

#### Claude Code (CLI alternative)

```bash
claude mcp add zenhub --env ZENHUB_API_KEY=PASTE_API_KEY_HERE -- npx -y zenhub-mcp
```

#### Codex CLI (TOML)

```toml
[mcp_servers.zenhub]
command = "npx"
args = ["-y", "zenhub-mcp"]
env = { ZENHUB_API_KEY = "PASTE_API_KEY_HERE" }
```

#### VS Code (different shape — `servers` not `mcpServers`)

```json
"zenhub": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "zenhub-mcp"],
  "env": { "ZENHUB_API_KEY": "PASTE_API_KEY_HERE" }
}
```

### Step 5 — Tell the user to restart their client

Say:

> Done. Restart **`<client_name>`** (close and reopen) so it picks up the MCP server.
>
> Exception: in **Claude Code**, no restart is needed — the new server is available on the next message.

### Step 6 — Validation phrase

Tell the user to test in their next chat:

> Say: **"List my WhatsApp connections via ZenHub MCP"**
>
> The AI should invoke `connections_list` and return real data from your account.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Tools don't appear in client | Client wasn't restarted | Close fully and reopen |
| `ZENHUB_API_KEY environment variable is required` | `env` block missing or misplaced | Confirm `env` is **inside** the `zenhub` server block |
| `HTTP 401 — API key invalida` | Wrong/revoked key | Generate new at https://www.zenhub.pro/settings/integrations |
| `Cannot find module zenhub-mcp` | Node too old | Confirm `node --version` ≥ 18 |
| First call slow (~10s) | npx downloading package | Normal — only happens once |

### Available tools (~50)

After successful setup, these tool families are exposed:

- `campaigns_*` — list, get, create, update, delete, stats, execute
- `groups_*` — list, get, members, create, add_member, remove_member, sync
- `schedules_*` — list, get, create, update, delete, retry
- `messages_*` — send, send_to_campaigns, bulk
- `conversations_*` — list, get, messages, reply (ZenChat)
- `contacts_*` — list, get, create, update, delete
- `connections_*` — list, get
- `stats_*` — dashboard, campaign
- `access_list_*` — list, grant, check, renew, revoke, stats
- `blacklist_*` — list, check, add, remove
- `buyers_*` — add (n8n / Make / Zapier ingestion)

Full schemas: run `tools/list` JSON-RPC against the server, or browse [`packages/tools/src/tools/`](packages/tools/src/tools/).

### Required behavior for the agent

1. **Ask one thing at a time** — client first, then API key. Don't dump 5 questions.
2. **Edit the config file yourself** if you have write permission. Don't make the user copy-paste.
3. **Show the diff before overwriting** an existing config file.
4. **End with the validation phrase** ("List my WhatsApp connections via ZenHub MCP").
5. **Use the exact paths from the table above** — don't invent or guess paths.

---

## ⚡ For humans — paste this into your AI

If you're a human reading this and want the AI to do the setup for you, paste this into Claude Desktop / Claude Code / Cursor / Codex / VS Code:

```
Configure the ZenHub MCP in my client following the instructions in
https://github.com/zenhubpro/zenhub-cli
```

The AI will read this README, ask for your client + API key, edit the right file, and tell you to restart. ~30 seconds.

If you prefer to do it manually, see [Manual setup per client](#manual-setup-per-client) below.

---

## Repo structure

This is a **monorepo** (npm workspaces):

| Package | Purpose | Bin |
|---|---|---|
| [`zenhub-cli`](packages/cli) | Terminal CLI (Commander) | `zenhub`, `zenhub-cli` |
| [`zenhub-mcp`](packages/mcp-stdio) | MCP server (stdio) for AI clients | `zenhub-mcp` |
| [`@zenhub/tools`](packages/tools) | Tool definitions (Zod) shared by CLI + MCP | — |
| [`@zenhub/client`](packages/client) | HTTP client + auth helpers | — |

---

## Manual setup per client

Skip this if you used the AI auto-setup above. These are the exact same configs the AI would write — copy into the file path listed in the [Step 3 table above](#step-3--locate-the-config-file-for-the-users-client).

### Claude Desktop

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
claude mcp add zenhub --env ZENHUB_API_KEY=agwpp_live_... -- npx -y zenhub-mcp
```

### Codex CLI

```toml
[mcp_servers.zenhub]
command = "npx"
args = ["-y", "zenhub-mcp"]
env = { ZENHUB_API_KEY = "agwpp_live_..." }
```

### Cursor

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

### VS Code

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

After saving, restart your client and ask: *"List my WhatsApp connections via ZenHub MCP"*.

---

## CLI usage (without MCP)

If you want to drive ZenHub from the terminal without an AI client, use the standalone CLI.

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
