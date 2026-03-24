# ZenHub CLI

CLI agent-native para automatizar o ZenHub via terminal ou IA.

## Instalação

```bash
npm install -g zenhub-cli
```

## Configuração

```bash
export ZENHUB_API_KEY=agwpp_live_xxxxxxxxxxxxxxxx
export ZENHUB_API_URL=https://api.zenhub.pro  # opcional, já é o padrão
```

## Uso

```bash
# Ver todos os comandos
zenhub --help

# Listar campanhas
zenhub campaigns list

# Detalhes de uma campanha
zenhub campaigns get <id>

# Criar agendamento
zenhub schedules create -c <campaign_id> -m "Olá grupo!" -d "2026-03-25T10:00:00"

# Enviar mensagem
zenhub messages send -g <group_id> -m "Mensagem de teste"

# Ver conversas do ZenChat
zenhub chat list --status open

# Responder conversa
zenhub chat reply <conversation_id> -m "Resposta via CLI"

# Dashboard
zenhub stats dashboard
```

## Modo JSON (para IAs e scripts)

Adicione `--json` para output estruturado:

```bash
zenhub campaigns list --json
zenhub stats dashboard --json
```

## Comandos disponíveis

| Comando | Descrição |
|---------|-----------|
| `campaigns` | Gerenciar campanhas (CRUD + stats + execute) |
| `groups` | Gerenciar grupos WhatsApp (list, create, members) |
| `schedules` | Gerenciar agendamentos de mensagens |
| `messages` | Enviar mensagens (send, bulk, send-to-campaigns) |
| `conversations` / `chat` | Conversas ZenChat (list, get, messages, reply) |
| `contacts` | Gerenciar contatos (CRUD + tags) |
| `connections` | Ver conexões WhatsApp e status |
| `stats` | Dashboard e analytics |
| `access-list` / `acl` | Lista de acesso (whitelist) por campanha |
| `blacklist` | Gerenciar números bloqueados |

## Uso com IA

Configure no Claude Code, Codex, ou qualquer AI que rode terminal:

```bash
# A IA pode rodar comandos como:
zenhub campaigns list --json
zenhub schedules create -c abc123 -m "Lembrete!" -d "2026-03-25T20:00:00" --json
zenhub chat list --status pending --json
```

O flag `--json` retorna dados estruturados que a IA parseia nativamente.
