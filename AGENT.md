# Instrucoes para agentes de IA

> Voce e um agente de IA (Claude Desktop, Claude Code, Codex, Cursor, Copilot, etc) e o usuario te pediu para configurar o **ZenHub MCP**. Siga este passo-a-passo.

## Visao geral

ZenHub MCP e um servidor stdio publicado no npm como `zenhub-mcp`. Expoe ~50 ferramentas para gerenciar campanhas WhatsApp, agendamentos, ZenChat e contatos.

## Passo 1 — Identificar o cliente do usuario

Pergunte: **"Em qual app voce ta usando IA agora? (Claude Desktop, Claude Code, Cursor, Codex CLI, VS Code, ou outro?)"**

Se voce **e** o cliente (esta rodando dentro dele), voce ja sabe — pule a pergunta e siga.

## Passo 2 — Obter API key

Pergunte: **"Qual sua API key do ZenHub? (formato `agwpp_live_...`)"**

Se ele nao tiver, instrua:

> 1. Abra https://www.zenhub.pro/settings/integrations
> 2. Clique em "Nova chave"
> 3. Defina nome (ex: "Claude MCP") e scope `write`
> 4. Copie a chave gerada (so aparece uma vez)

## Passo 3 — Localizar o config file

| Cliente | Path | OS |
|---|---|---|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` | macOS |
| Claude Desktop | `%APPDATA%\Claude\claude_desktop_config.json` | Windows |
| Claude Desktop | `~/.config/Claude/claude_desktop_config.json` | Linux |
| Claude Code | `~/.claude.json` | todos |
| Cursor (global) | `~/.cursor/mcp.json` | todos |
| Cursor (projeto) | `.cursor/mcp.json` no cwd | todos |
| Codex CLI | `~/.codex/config.toml` | todos |
| VS Code (projeto) | `.vscode/mcp.json` no cwd | todos |

Se o file ainda nao existir, **crie** com o conteudo abaixo. Se ja existir, **mescle** a chave `mcpServers` (ou `servers` no VS Code, ou `[mcp_servers.zenhub]` no TOML do Codex) preservando o conteudo atual.

## Passo 4 — Aplicar a config

### JSON (Claude Desktop, Claude Code, Cursor)

Adicione dentro de `mcpServers`:

```json
"zenhub": {
  "command": "npx",
  "args": ["-y", "zenhub-mcp"],
  "env": { "ZENHUB_API_KEY": "AGWPP_LIVE_AQUI" }
}
```

### Claude Code (alternativa via CLI)

Pode rodar direto:

```bash
claude mcp add zenhub --env ZENHUB_API_KEY=AGWPP_LIVE_AQUI -- npx -y zenhub-mcp
```

### TOML (Codex CLI)

```toml
[mcp_servers.zenhub]
command = "npx"
args = ["-y", "zenhub-mcp"]
env = { ZENHUB_API_KEY = "AGWPP_LIVE_AQUI" }
```

### JSON (VS Code — formato diferente)

Dentro de `servers`:

```json
"zenhub": {
  "type": "stdio",
  "command": "npx",
  "args": ["-y", "zenhub-mcp"],
  "env": { "ZENHUB_API_KEY": "AGWPP_LIVE_AQUI" }
}
```

## Passo 5 — Reiniciar o cliente

Diga ao usuario:

> Pronto. Reinicie o **`<cliente>`** (feche e abra de novo) para carregar o servidor MCP.

Em **Claude Code** nao precisa reiniciar — o MCP novo aparece na proxima invocacao.

## Passo 6 — Validar

Apos o restart, peca para o usuario testar:

> No proximo chat, fale: **"Liste minhas conexoes WhatsApp via ZenHub MCP"**
> A IA deve invocar a ferramenta `connections_list` e retornar os dados.

Se der erro:

| Erro | Causa | Fix |
|---|---|---|
| Tool nao aparece | Cliente nao reiniciou | Feche e abra |
| `ZENHUB_API_KEY environment variable is required` | Env mal configurada no JSON/TOML | Confirme que `env` esta dentro do bloco zenhub |
| `HTTP 401 — API key invalida` | Chave errada/revogada | Gere nova em https://www.zenhub.pro/settings/integrations |
| `Cannot find module zenhub-mcp` | Node muito antigo | Confirme `node --version` >= 18 |
| `npx` lento na primeira execucao | Download do pacote | Normal — leva ~10s na primeira chamada |

## Tools disponiveis

Apos config bem-sucedida, ~50 tools sao expostas:

- **campaigns_*** — list/get/create/update/delete/stats/execute
- **groups_*** — list/get/members/create/add_member/remove_member/sync
- **schedules_*** — list/get/create/update/delete/retry
- **messages_*** — send/send_to_campaigns/bulk
- **conversations_*** — list/get/messages/reply (ZenChat)
- **contacts_*** — list/get/create/update/delete
- **connections_*** — list/get
- **stats_*** — dashboard/campaign
- **access_list_*** — list/grant/check/renew/revoke/stats
- **blacklist_*** — list/check/add/remove
- **buyers_*** — add (n8n/Make/Zapier ingestion)

Schemas completos: `tools/list` JSON-RPC ou [packages/tools/src/tools/](https://github.com/zenhubpro/zenhub-cli/tree/main/packages/tools/src/tools).

## Caso o usuario peca instalacao via CLI direto (sem MCP)

Se ele preferir rodar comandos no terminal:

```bash
npm install -g zenhub-cli
zenhub login    # abre browser para auth
zenhub campaigns list
```

CLI e MCP sao complementares — ele pode ter os dois. CLI: digita comandos. MCP: IA invoca tools nativamente.

## Para o agente: comportamento esperado

1. **Pergunte uma coisa por vez** — cliente, depois API key. Nao saia despejando 5 perguntas.
2. **Edite o file voce mesmo** — nao mande o usuario fazer copy-paste se voce tem permissao de write.
3. **Confirme antes de sobrescrever** — se o config file ja tinha conteudo, mostre o diff antes de salvar.
4. **Termine com a frase de validacao** ("Liste minhas conexoes WhatsApp via ZenHub MCP").
5. **Nao invente paths** — use exatamente os listados na tabela do Passo 3.
