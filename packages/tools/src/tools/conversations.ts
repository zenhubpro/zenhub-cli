import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'conversations';

export const conversationsTools = [
  defineTool({
    name: 'conversations_list',
    category: CAT,
    description: 'List ZenChat conversations with optional filters',
    schema: {
      status: z.enum(['open', 'pending', 'resolved', 'snoozed']).optional(),
      assignee_id: z.string().optional(),
      page: z.number().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, args) => c.get('/v1/conversations', args),
  }),
  defineTool({
    name: 'conversations_get',
    category: CAT,
    description: 'Get conversation details',
    schema: { id: z.string() },
    handler: (c, { id }) => c.get(`/v1/conversations/${id}`),
  }),
  defineTool({
    name: 'conversations_messages',
    category: CAT,
    description: 'List messages in a conversation',
    schema: {
      id: z.string(),
      cursor: z.string().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, { id, ...q }) => c.get(`/v1/conversations/${id}/messages`, q),
  }),
  defineTool({
    name: 'conversations_reply',
    category: CAT,
    description: 'Send a message to a conversation',
    schema: {
      id: z.string(),
      content: z.string(),
      private: z.boolean().optional().describe('Private note (not visible to contact)'),
    },
    handler: (c, { id, content, private: priv }) =>
      c.post(`/v1/conversations/${id}/messages`, { content, private: priv ?? false }),
  }),
];
