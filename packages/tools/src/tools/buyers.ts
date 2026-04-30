import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'buyers';

export const buyersTools = [
  defineTool({
    name: 'buyers_add',
    category: CAT,
    description:
      "Add a buyer to the organization's list (used by n8n/Make/Zapier integrations).",
    schema: {
      phone: z.string().describe('e.g. +5511987654321'),
      name: z.string().optional(),
      email: z.string().optional(),
      product_name: z.string().optional(),
      external_id: z.string().optional(),
      metadata: z.record(z.any()).optional(),
    },
    handler: (c, args) => c.post('/v1/public/buyers', args),
  }),
  defineTool({
    name: 'public_ping',
    category: CAT,
    description: 'Health check + verify API key is active',
    schema: {},
    handler: (c) => c.post('/v1/public/ping'),
  }),
];
