import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'groups';

export const groupsTools = [
  defineTool({
    name: 'groups_list',
    category: CAT,
    description: 'List WhatsApp groups with optional filters',
    schema: {
      campaign_id: z.string().optional(),
      page: z.number().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, args) => c.get('/v1/groups', args),
  }),
  defineTool({
    name: 'groups_get',
    category: CAT,
    description: 'Get group details by ID',
    schema: { id: z.string() },
    handler: (c, { id }) => c.get(`/v1/groups/${id}`),
  }),
  defineTool({
    name: 'groups_members',
    category: CAT,
    description: 'List members of a group in a campaign',
    schema: { campaign_id: z.string(), group_id: z.string() },
    handler: (c, { campaign_id, group_id }) =>
      c.get(`/v1/campaigns/${campaign_id}/groups/${group_id}/members`),
  }),
  defineTool({
    name: 'groups_create',
    category: CAT,
    description: 'Create a new group in a campaign',
    schema: {
      campaign_id: z.string(),
      name: z.string(),
      member_limit: z.number().optional(),
    },
    handler: (c, { campaign_id, ...body }) =>
      c.post(`/v1/campaigns/${campaign_id}/groups`, body),
  }),
  defineTool({
    name: 'groups_add_member',
    category: CAT,
    description: 'Add members to a group by phone numbers',
    schema: {
      campaign_id: z.string(),
      group_id: z.string(),
      phones: z.array(z.string()).describe('Phone numbers e.g. ["5511999990000"]'),
    },
    handler: (c, { campaign_id, group_id, phones }) =>
      c.post(`/v1/campaigns/${campaign_id}/groups/${group_id}/members`, { phones }),
  }),
  defineTool({
    name: 'groups_remove_member',
    category: CAT,
    description: 'Remove a member from a group',
    schema: {
      campaign_id: z.string(),
      group_id: z.string(),
      phone: z.string(),
    },
    handler: (c, { campaign_id, group_id, phone }) =>
      c.del(`/v1/campaigns/${campaign_id}/groups/${group_id}/members/${phone}`),
  }),
  defineTool({
    name: 'groups_sync_members',
    category: CAT,
    description: 'Sync members of all groups in a campaign',
    schema: { campaign_id: z.string() },
    handler: (c, { campaign_id }) =>
      c.post(`/v1/campaigns/${campaign_id}/sync-members`),
  }),
  defineTool({
    name: 'groups_import',
    category: CAT,
    description: 'Import existing WhatsApp groups into a campaign',
    schema: {
      campaign_id: z.string(),
      group_ids: z.array(z.string()).describe('WhatsApp group JIDs to import'),
    },
    handler: (c, { campaign_id, group_ids }) =>
      c.post(`/v1/campaigns/${campaign_id}/groups/import`, { group_ids }),
  }),
  defineTool({
    name: 'groups_remove_from_campaign',
    category: CAT,
    description: 'Remove a group from a campaign (does not delete on WhatsApp)',
    schema: { campaign_id: z.string(), group_id: z.string() },
    handler: (c, { campaign_id, group_id }) =>
      c.del(`/v1/campaigns/${campaign_id}/groups/${group_id}`),
  }),
  defineTool({
    name: 'campaigns_members',
    category: CAT,
    description: 'List all members across all groups of a campaign',
    schema: {
      campaign_id: z.string(),
      page: z.number().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, { campaign_id, ...q }) =>
      c.get(`/v1/campaigns/${campaign_id}/members`, q),
  }),
];
