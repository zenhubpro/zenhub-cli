import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'access-list';

export const accessListTools = [
  defineTool({
    name: 'access_list_list',
    category: CAT,
    description: 'List access list (whitelist) entries for a campaign',
    schema: {
      campaign_id: z.string(),
      page: z.number().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, { campaign_id, ...q }) => c.get(`/v1/access-list/${campaign_id}`, q),
  }),
  defineTool({
    name: 'access_list_grant',
    category: CAT,
    description: 'Grant access to a phone number in a campaign',
    schema: {
      campaign_id: z.string(),
      phone: z.string(),
      name: z.string().optional(),
      expires_at: z.string().optional().describe('ISO 8601 expiration date'),
    },
    handler: (c, { campaign_id, ...body }) =>
      c.post(`/v1/access-list/${campaign_id}`, body),
  }),
  defineTool({
    name: 'access_list_bulk_grant',
    category: CAT,
    description: 'Grant access to multiple phone numbers at once',
    schema: {
      campaign_id: z.string(),
      entries: z.array(
        z.object({
          phone: z.string(),
          name: z.string().optional(),
          expires_at: z.string().optional(),
        }),
      ),
    },
    handler: (c, { campaign_id, entries }) =>
      c.post(`/v1/access-list/${campaign_id}/bulk`, { entries }),
  }),
  defineTool({
    name: 'access_list_check',
    category: CAT,
    description: 'Check if a phone number has active access',
    schema: { campaign_id: z.string(), phone: z.string() },
    handler: (c, { campaign_id, phone }) =>
      c.post(`/v1/access-list/${campaign_id}/check`, { phone }),
  }),
  defineTool({
    name: 'access_list_renew',
    category: CAT,
    description: 'Renew access for a phone number',
    schema: {
      campaign_id: z.string(),
      phone: z.string(),
      expires_at: z.string(),
    },
    handler: (c, { campaign_id, phone, expires_at }) =>
      c.post(`/v1/access-list/${campaign_id}/renew`, { phone, expires_at }),
  }),
  defineTool({
    name: 'access_list_revoke',
    category: CAT,
    description: 'Revoke access for a phone number',
    schema: { campaign_id: z.string(), phone: z.string() },
    handler: (c, { campaign_id, phone }) =>
      c.del(`/v1/access-list/${campaign_id}/${phone}`),
  }),
  defineTool({
    name: 'access_list_stats',
    category: CAT,
    description: 'Get access list statistics for a campaign',
    schema: { campaign_id: z.string() },
    handler: (c, { campaign_id }) => c.get(`/v1/access-list/${campaign_id}/stats`),
  }),
];
