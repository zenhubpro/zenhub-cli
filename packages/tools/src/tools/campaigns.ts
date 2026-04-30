import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'campaigns';

export const campaignsTools = [
  defineTool({
    name: 'campaigns_list',
    category: CAT,
    description: 'List all campaigns with optional pagination',
    schema: {
      page: z.number().optional().describe('Page number (default 1)'),
      per_page: z.number().optional().describe('Results per page (default 20)'),
    },
    handler: (c, args) => c.get('/v1/campaigns', args),
  }),
  defineTool({
    name: 'campaigns_get',
    category: CAT,
    description: 'Get campaign details by ID',
    schema: { id: z.string().describe('Campaign ID') },
    handler: (c, { id }) => c.get(`/v1/campaigns/${id}`),
  }),
  defineTool({
    name: 'campaigns_create',
    category: CAT,
    description: 'Create a new campaign',
    schema: {
      name: z.string().describe('Campaign name'),
      description: z.string().optional(),
      primary_connection_id: z.string().optional(),
      distribution_mode: z.enum(['sequential', 'random']).optional(),
      auto_create_groups: z.boolean().optional(),
      default_member_limit: z.number().optional(),
    },
    handler: (c, args) => c.post('/v1/campaigns', args),
  }),
  defineTool({
    name: 'campaigns_update',
    category: CAT,
    description: 'Update a campaign',
    schema: {
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      is_active: z.boolean().optional(),
    },
    handler: (c, { id, ...body }) => c.patch(`/v1/campaigns/${id}`, body),
  }),
  defineTool({
    name: 'campaigns_delete',
    category: CAT,
    description: 'Delete a campaign',
    schema: { id: z.string() },
    handler: (c, { id }) => c.del(`/v1/campaigns/${id}`),
  }),
  defineTool({
    name: 'campaigns_stats',
    category: CAT,
    description: 'Get campaign statistics',
    schema: { id: z.string() },
    handler: (c, { id }) => c.get(`/v1/campaigns/${id}/stats`),
  }),
  defineTool({
    name: 'campaigns_execute',
    category: CAT,
    description: 'Execute campaign immediately',
    schema: { id: z.string() },
    handler: (c, { id }) => c.post(`/v1/campaigns/${id}/execute`),
  }),
];
