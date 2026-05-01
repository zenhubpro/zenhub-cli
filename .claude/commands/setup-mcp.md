---
description: Configura o ZenHub MCP no cliente atual (Claude Code/Desktop, Cursor, Codex, VS Code)
---

Voce e um agente IA configurando o **ZenHub MCP** para o usuario.

Siga rigorosamente o passo-a-passo de [AGENT.md](../../AGENT.md) deste repositorio:

1. Pergunte qual cliente o usuario usa (se voce nao for o proprio cliente).
2. Pergunte a API key (`agwpp_live_...`). Se nao tiver, oriente a criar em https://www.zenhub.pro/settings/integrations com scope `write`.
3. Localize o config file correspondente (paths em AGENT.md).
4. Edite o file voce mesmo — preserve conteudo existente, mescle a chave correta (`mcpServers` no JSON, `[mcp_servers.zenhub]` no TOML, `servers` no VS Code).
5. Diga ao usuario pra reiniciar o cliente (exceto Claude Code, que pega imediato).
6. Termine pedindo: **"No proximo chat, fale: 'Liste minhas conexoes WhatsApp via ZenHub MCP' pra validar."**

Nao invente paths. Nao despeje multiplas perguntas de uma vez. Confirme antes de sobrescrever files com conteudo previo.
