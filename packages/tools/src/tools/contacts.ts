import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'contacts';

export const contactsTools = [
  defineTool({
    name: 'contacts_list',
    category: CAT,
    description: 'List contacts with optional search and filters',
    schema: {
      search: z.string().optional(),
      tag: z.string().optional(),
      page: z.number().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, args) => c.get('/v1/contacts', args),
  }),
  defineTool({
    name: 'contacts_get',
    category: CAT,
    description: 'Get contact details by ID',
    schema: { id: z.string() },
    handler: (c, { id }) => c.get(`/v1/contacts/${id}`),
  }),
  defineTool({
    name: 'contacts_create',
    category: CAT,
    description: 'Create a new contact',
    schema: {
      phone_number: z.string().describe('e.g. +5511999990000'),
      name: z.string().optional(),
      email: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    handler: (c, args) => c.post('/v1/contacts', args),
  }),
  defineTool({
    name: 'contacts_update',
    category: CAT,
    description: 'Update a contact',
    schema: {
      id: z.string(),
      name: z.string().optional(),
      email: z.string().optional(),
      tags: z.array(z.string()).optional(),
    },
    handler: (c, { id, ...body }) => c.patch(`/v1/contacts/${id}`, body),
  }),
  defineTool({
    name: 'contacts_delete',
    category: CAT,
    description: 'Delete a contact',
    schema: { id: z.string() },
    handler: (c, { id }) => c.del(`/v1/contacts/${id}`),
  }),
];
