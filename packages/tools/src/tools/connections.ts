import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'connections';

export const connectionsTools = [
  defineTool({
    name: 'connections_list',
    category: CAT,
    description: 'List all WhatsApp connections and their status',
    schema: {},
    handler: (c) => c.get('/v1/connections'),
  }),
  defineTool({
    name: 'connections_get',
    category: CAT,
    description: 'Get connection details by ID',
    schema: { id: z.string() },
    handler: (c, { id }) => c.get(`/v1/connections/${id}`),
  }),
];
