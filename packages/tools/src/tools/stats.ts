import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'stats';

export const statsTools = [
  defineTool({
    name: 'stats_dashboard',
    category: CAT,
    description: 'Get organization dashboard overview with KPIs',
    schema: {},
    handler: (c) => c.get('/v1/stats/dashboard'),
  }),
  defineTool({
    name: 'stats_campaign',
    category: CAT,
    description: 'Get statistics for a specific campaign',
    schema: { id: z.string() },
    handler: (c, { id }) => c.get(`/v1/stats/campaigns/${id}`),
  }),
];
