import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'leads';

/**
 * Ferramentas de LEADS/PIPELINE (Kanban CRM) do ZenChat — espelham a API publica
 * /api/v1/pipelines e /api/v1/leads (auth por API key). `leads_create` e o
 * "Adicionar ao pipeline": cria um card pro contato num pipeline/coluna
 * (findOrCreate do contato por phone/email + card). Sem coluna => 1a coluna do
 * pipeline. A idempotencia/efeitos ficam no backend (KanbanService.createCard).
 */
export const leadsTools = [
  defineTool({
    name: 'leads_pipelines_list',
    category: CAT,
    description:
      'Lista os pipelines (funis) do Kanban com suas colunas/estagios. Use para descobrir pipeline_id/column_id antes de criar um lead.',
    schema: {},
    handler: (c) => c.get('/v1/pipelines'),
  }),
  defineTool({
    name: 'leads_list',
    category: CAT,
    description:
      'Lista os leads (cards) do Kanban, com filtros opcionais por pipeline, coluna e status.',
    schema: {
      pipeline_id: z.string().optional().describe('Filtra por pipeline'),
      column_id: z.string().optional().describe('Filtra por coluna/estagio'),
      status: z
        .enum(['open', 'pending', 'resolved'])
        .optional()
        .describe('Filtra por status do card'),
      page: z.number().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, args) => c.get('/v1/leads', args),
  }),
  defineTool({
    name: 'leads_create',
    category: CAT,
    description:
      'Adiciona ao pipeline: cria um lead/card num pipeline/coluna (resolve ou cria o contato por phone/email). Sem column_id, usa a primeira coluna do pipeline; sem pipeline_id, o pipeline padrao.',
    schema: {
      pipeline_id: z
        .string()
        .optional()
        .describe('Pipeline de destino (padrao: o primeiro/principal).'),
      column_id: z
        .string()
        .optional()
        .describe('Coluna/estagio de destino (padrao: a primeira coluna do pipeline).'),
      name: z.string().optional().describe('Nome do contato/lead.'),
      phone: z
        .string()
        .optional()
        .describe('Telefone do contato (resolve/cria o contato por telefone).'),
      email: z.string().optional().describe('E-mail do contato.'),
      tags: z.array(z.string()).optional().describe('Etiquetas do card.'),
      notes: z.string().optional().describe('Observacoes/anotacoes do card.'),
    },
    handler: (c, args) => c.post('/v1/leads', args),
  }),
  defineTool({
    name: 'leads_update',
    category: CAT,
    description:
      'Atualiza um lead/card: mover de coluna, mudar status, atribuir atendente ou ajustar tags.',
    schema: {
      id: z.string().describe('ID do lead/card.'),
      column_id: z.string().optional().describe('Move o card para esta coluna.'),
      status: z
        .enum(['open', 'pending', 'resolved'])
        .optional()
        .describe('Novo status do card.'),
      assignee: z
        .string()
        .nullable()
        .optional()
        .describe('Atendente (id, nome ou e-mail). null remove a atribuicao.'),
      add_tags: z.array(z.string()).optional().describe('Tags a adicionar.'),
      remove_tags: z.array(z.string()).optional().describe('Tags a remover.'),
      title: z.string().optional().describe('Novo titulo do card.'),
      notes: z.string().optional().describe('Observacoes/anotacoes do card.'),
    },
    handler: (c, { id, ...body }) => c.patch(`/v1/leads/${id}`, body),
  }),
];
