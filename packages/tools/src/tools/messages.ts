import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'messages';

const messageType = z.enum(['text', 'image', 'video', 'audio', 'document', 'poll']);

export const messagesTools = [
  defineTool({
    name: 'messages_send',
    category: CAT,
    description: 'Send a message to a WhatsApp group',
    schema: {
      connection_id: z.string().describe('Connection/instance UUID'),
      to: z.string().describe('Group JID e.g. 120363...@g.us'),
      type: messageType,
      message: z.string().optional(),
      media_url: z.string().optional(),
      media_filename: z.string().optional(),
      media_mimetype: z.string().optional(),
      mention_all: z.boolean().optional(),
    },
    handler: (c, args) => c.post('/v1/messages/send', args),
  }),
  defineTool({
    name: 'messages_send_to_campaigns',
    category: CAT,
    description: 'Send a message to all groups of one or more campaigns',
    schema: {
      campaign_ids: z.array(z.string()).describe('Campaign UUIDs (at least one)'),
      type: messageType,
      message: z.string().optional(),
      media_url: z.string().optional(),
      media_filename: z.string().optional(),
      media_mimetype: z.string().optional(),
      mention_all: z.boolean().optional(),
    },
    handler: (c, args) => c.post('/v1/messages/send-to-campaigns', args),
  }),
  defineTool({
    name: 'messages_bulk',
    category: CAT,
    description: 'Send bulk messages to multiple groups',
    schema: {
      connection_id: z.string(),
      recipients: z
        .array(z.object({ to: z.string(), message: z.string().optional() }))
        .describe('List of recipients with group JID and optional custom message'),
      default_message: z.string().optional(),
      type: messageType,
      media_url: z.string().optional(),
      media_filename: z.string().optional(),
      delay_ms: z.number().optional().describe('Default 1000'),
    },
    handler: (c, args) => c.post('/v1/messages/bulk', args),
  }),
];
