import { z } from 'zod';
import { defineTool } from '../types';

const CAT = 'schedules';

export const schedulesTools = [
  defineTool({
    name: 'schedules_list',
    category: CAT,
    description: 'List message schedules with optional filters',
    schema: {
      campaign_id: z.string().optional(),
      status: z.string().optional().describe('pending, sent, failed'),
      page: z.number().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, args) => c.get('/v1/schedules', args),
  }),
  defineTool({
    name: 'schedules_get',
    category: CAT,
    description: 'Get schedule details by ID',
    schema: { id: z.string() },
    handler: (c, { id }) => c.get(`/v1/schedules/${id}`),
  }),
  defineTool({
    name: 'schedules_create',
    category: CAT,
    description: 'Create a new message schedule',
    schema: {
      campaign_id: z.string(),
      message: z.string(),
      scheduled_at: z.string().describe('ISO 8601 datetime'),
      group_id: z.string().optional(),
      media_url: z.string().optional(),
    },
    handler: (c, args) => c.post('/v1/schedules', args),
  }),
  defineTool({
    name: 'schedules_update',
    category: CAT,
    description: 'Update a schedule',
    schema: {
      id: z.string(),
      message: z.string().optional(),
      scheduled_at: z.string().optional(),
    },
    handler: (c, { id, ...body }) => c.patch(`/v1/schedules/${id}`, body),
  }),
  defineTool({
    name: 'schedules_delete',
    category: CAT,
    description: 'Delete a schedule',
    schema: { id: z.string() },
    handler: (c, { id }) => c.del(`/v1/schedules/${id}`),
  }),
  defineTool({
    name: 'schedules_retry',
    category: CAT,
    description: 'Retry a failed schedule',
    schema: { campaign_id: z.string(), schedule_id: z.string() },
    handler: (c, { campaign_id, schedule_id }) =>
      c.post(`/v1/campaigns/${campaign_id}/schedules/${schedule_id}/retry`),
  }),
  defineTool({
    name: 'campaign_schedules_list',
    category: CAT,
    description: 'List schedules of a specific campaign',
    schema: {
      campaign_id: z.string(),
      status: z.string().optional(),
      page: z.number().optional(),
      per_page: z.number().optional(),
    },
    handler: (c, { campaign_id, ...q }) =>
      c.get(`/v1/campaigns/${campaign_id}/schedules`, q),
  }),
  defineTool({
    name: 'campaign_schedules_create',
    category: CAT,
    description: 'Create a schedule for a specific campaign',
    schema: {
      campaign_id: z.string(),
      message: z.string(),
      scheduled_at: z.string().describe('ISO 8601 datetime'),
      group_id: z.string().optional(),
      media_url: z.string().optional(),
    },
    handler: (c, { campaign_id, ...body }) =>
      c.post(`/v1/campaigns/${campaign_id}/schedules`, body),
  }),
  defineTool({
    name: 'campaign_schedules_get',
    category: CAT,
    description: 'Get a campaign-scoped schedule by ID',
    schema: { campaign_id: z.string(), schedule_id: z.string() },
    handler: (c, { campaign_id, schedule_id }) =>
      c.get(`/v1/campaigns/${campaign_id}/schedules/${schedule_id}`),
  }),
  defineTool({
    name: 'campaign_schedules_update',
    category: CAT,
    description: 'Update a campaign-scoped schedule',
    schema: {
      campaign_id: z.string(),
      schedule_id: z.string(),
      message: z.string().optional(),
      scheduled_at: z.string().optional(),
    },
    handler: (c, { campaign_id, schedule_id, ...body }) =>
      c.patch(`/v1/campaigns/${campaign_id}/schedules/${schedule_id}`, body),
  }),
  defineTool({
    name: 'campaign_schedules_delete',
    category: CAT,
    description: 'Cancel a campaign-scoped schedule',
    schema: { campaign_id: z.string(), schedule_id: z.string() },
    handler: (c, { campaign_id, schedule_id }) =>
      c.del(`/v1/campaigns/${campaign_id}/schedules/${schedule_id}`),
  }),
];
