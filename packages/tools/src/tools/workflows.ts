import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'workflows';

export const workflowsTools = [
  defineTool({
    name: 'workflows_list',
    category: CAT,
    description: 'Lista os workflows (automacoes) configurados na organizacao.',
    schema: {},
    handler: (c) => c.get('/v1/workflows'),
  }),
  defineTool({
    name: 'workflow_run',
    category: CAT,
    description:
      'Executa manualmente um workflow pelo ID. Pode receber um payload de entrada opcional.',
    schema: {
      id: z.string().describe('ID do workflow'),
      input: z.record(z.unknown()).optional().describe('Payload de entrada para a execucao'),
    },
    handler: (c, { id, input }) => c.post(`/v1/workflows/${id}/run`, input ?? {}),
  }),
];
