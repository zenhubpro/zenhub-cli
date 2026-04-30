import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'blacklist';

export const blacklistTools = [
  defineTool({
    name: 'blacklist_list',
    category: CAT,
    description: 'List blocked phone numbers',
    schema: {
      page: z.number().optional(),
      limit: z.number().optional(),
    },
    handler: (c, args) => c.get('/v1/blacklist', args),
  }),
  defineTool({
    name: 'blacklist_check',
    category: CAT,
    description: 'Check if a phone number is blacklisted',
    schema: { phone: z.string() },
    handler: (c, { phone }) => c.get(`/v1/blacklist/check/${phone}`),
  }),
  defineTool({
    name: 'blacklist_add',
    category: CAT,
    description: 'Add a phone number to the blacklist',
    schema: {
      phone: z.string(),
      reason: z.string().optional(),
    },
    handler: (c, args) => c.post('/v1/blacklist', args),
  }),
  defineTool({
    name: 'blacklist_bulk_add',
    category: CAT,
    description: 'Add multiple phone numbers to the blacklist',
    schema: {
      entries: z.array(
        z.object({ phone: z.string(), reason: z.string().optional() }),
      ),
    },
    handler: (c, { entries }) => c.post('/v1/blacklist/bulk', { entries }),
  }),
  defineTool({
    name: 'blacklist_remove',
    category: CAT,
    description: 'Remove a phone number from the blacklist',
    schema: { id: z.string().describe('Blacklist entry ID') },
    handler: (c, { id }) => c.del(`/v1/blacklist/${id}`),
  }),
];
