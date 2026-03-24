#!/usr/bin/env node

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { ZenHubClient } from '../lib/client';

// ---------------------------------------------------------------------------
// Config from env
// ---------------------------------------------------------------------------
const apiKey = process.env.ZENHUB_API_KEY ?? '';
const apiUrl = process.env.ZENHUB_API_URL ?? 'https://api.zenhub.pro/api';

function getClient(): ZenHubClient {
  if (!apiKey) {
    throw new Error(
      'ZENHUB_API_KEY environment variable is required. ' +
      'Set it before starting the MCP server.',
    );
  }
  return new ZenHubClient({ apiKey, apiUrl });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Wrap a client call into MCP tool response format */
async function wrap(fn: () => Promise<any>): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  try {
    const res = await fn();
    return { content: [{ type: 'text' as const, text: JSON.stringify(res, null, 2) }] };
  } catch (err: any) {
    return { content: [{ type: 'text' as const, text: JSON.stringify({ error: err.message }, null, 2) }] };
  }
}

// ---------------------------------------------------------------------------
// Server
// ---------------------------------------------------------------------------

const server = new McpServer({
  name: 'zenhub',
  version: '0.1.0',
});

// ========================== CAMPAIGNS ======================================

server.tool(
  'campaigns_list',
  'List all campaigns with optional pagination',
  { page: z.number().optional().describe('Page number (default 1)'), per_page: z.number().optional().describe('Results per page (default 20)') },
  async ({ page, per_page }) => wrap(() => getClient().get('/v1/campaigns', { page, per_page })),
);

server.tool(
  'campaigns_get',
  'Get campaign details by ID',
  { id: z.string().describe('Campaign ID') },
  async ({ id }) => wrap(() => getClient().get(`/v1/campaigns/${id}`)),
);

server.tool(
  'campaigns_create',
  'Create a new campaign',
  {
    name: z.string().describe('Campaign name'),
    description: z.string().optional().describe('Campaign description'),
    primary_connection_id: z.string().optional().describe('Primary WhatsApp connection ID'),
  },
  async (args) => wrap(() => getClient().post('/v1/campaigns', args)),
);

server.tool(
  'campaigns_update',
  'Update a campaign',
  {
    id: z.string().describe('Campaign ID'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    is_active: z.boolean().optional().describe('Activate/deactivate'),
  },
  async ({ id, ...body }) => {
    const filtered = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));
    return wrap(() => getClient().patch(`/v1/campaigns/${id}`, filtered));
  },
);

server.tool(
  'campaigns_delete',
  'Delete a campaign',
  { id: z.string().describe('Campaign ID') },
  async ({ id }) => wrap(() => getClient().del(`/v1/campaigns/${id}`)),
);

server.tool(
  'campaigns_stats',
  'Get campaign statistics',
  { id: z.string().describe('Campaign ID') },
  async ({ id }) => wrap(() => getClient().get(`/v1/campaigns/${id}/stats`)),
);

server.tool(
  'campaigns_execute',
  'Execute campaign immediately',
  { id: z.string().describe('Campaign ID') },
  async ({ id }) => wrap(() => getClient().post(`/v1/campaigns/${id}/execute`)),
);

// ========================== GROUPS =========================================

server.tool(
  'groups_list',
  'List WhatsApp groups with optional filters',
  {
    campaign_id: z.string().optional().describe('Filter by campaign ID'),
    page: z.number().optional().describe('Page number'),
    per_page: z.number().optional().describe('Results per page'),
  },
  async ({ campaign_id, page, per_page }) =>
    wrap(() => getClient().get('/v1/groups', { campaign_id, page, per_page })),
);

server.tool(
  'groups_get',
  'Get group details by ID',
  { id: z.string().describe('Group ID') },
  async ({ id }) => wrap(() => getClient().get(`/v1/groups/${id}`)),
);

server.tool(
  'groups_members',
  'List members of a group in a campaign',
  {
    campaign_id: z.string().describe('Campaign ID'),
    group_id: z.string().describe('Group ID'),
  },
  async ({ campaign_id, group_id }) =>
    wrap(() => getClient().get(`/v1/campaigns/${campaign_id}/groups/${group_id}/members`)),
);

server.tool(
  'groups_create',
  'Create a new group in a campaign',
  {
    campaign_id: z.string().describe('Campaign ID'),
    name: z.string().describe('Group name'),
    member_limit: z.number().optional().describe('Member limit'),
  },
  async ({ campaign_id, name, member_limit }) => {
    const body: any = { name };
    if (member_limit !== undefined) body.member_limit = member_limit;
    return wrap(() => getClient().post(`/v1/campaigns/${campaign_id}/groups`, body));
  },
);

server.tool(
  'groups_add_member',
  'Add members to a group by phone numbers',
  {
    campaign_id: z.string().describe('Campaign ID'),
    group_id: z.string().describe('Group ID'),
    phones: z.array(z.string()).describe('Phone numbers to add (e.g. ["5511999990000"])'),
  },
  async ({ campaign_id, group_id, phones }) =>
    wrap(() => getClient().post(`/v1/campaigns/${campaign_id}/groups/${group_id}/members`, { phones })),
);

server.tool(
  'groups_remove_member',
  'Remove a member from a group',
  {
    campaign_id: z.string().describe('Campaign ID'),
    group_id: z.string().describe('Group ID'),
    phone: z.string().describe('Phone number to remove'),
  },
  async ({ campaign_id, group_id, phone }) =>
    wrap(() => getClient().del(`/v1/campaigns/${campaign_id}/groups/${group_id}/members/${phone}`)),
);

server.tool(
  'groups_sync_members',
  'Sync members of all groups in a campaign',
  { campaign_id: z.string().describe('Campaign ID') },
  async ({ campaign_id }) =>
    wrap(() => getClient().post(`/v1/campaigns/${campaign_id}/sync-members`)),
);

// ========================== SCHEDULES ======================================

server.tool(
  'schedules_list',
  'List message schedules with optional filters',
  {
    campaign_id: z.string().optional().describe('Filter by campaign ID'),
    status: z.string().optional().describe('Filter by status (pending, sent, failed)'),
    page: z.number().optional().describe('Page number'),
    per_page: z.number().optional().describe('Results per page'),
  },
  async ({ campaign_id, status, page, per_page }) =>
    wrap(() => getClient().get('/v1/schedules', { campaign_id, status, page, per_page })),
);

server.tool(
  'schedules_get',
  'Get schedule details by ID',
  { id: z.string().describe('Schedule ID') },
  async ({ id }) => wrap(() => getClient().get(`/v1/schedules/${id}`)),
);

server.tool(
  'schedules_create',
  'Create a new message schedule',
  {
    campaign_id: z.string().describe('Campaign ID'),
    message: z.string().describe('Message content'),
    scheduled_at: z.string().describe('Scheduled datetime (ISO 8601, e.g. 2026-03-25T10:00:00)'),
    group_id: z.string().optional().describe('Target specific group ID'),
    media_url: z.string().optional().describe('Media URL to attach'),
  },
  async (args) => {
    const body = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined));
    return wrap(() => getClient().post('/v1/schedules', body));
  },
);

server.tool(
  'schedules_update',
  'Update a schedule',
  {
    id: z.string().describe('Schedule ID'),
    message: z.string().optional().describe('New message content'),
    scheduled_at: z.string().optional().describe('New datetime (ISO 8601)'),
  },
  async ({ id, ...body }) => {
    const filtered = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));
    return wrap(() => getClient().patch(`/v1/schedules/${id}`, filtered));
  },
);

server.tool(
  'schedules_delete',
  'Delete a schedule',
  { id: z.string().describe('Schedule ID') },
  async ({ id }) => wrap(() => getClient().del(`/v1/schedules/${id}`)),
);

// ========================== MESSAGES =======================================

server.tool(
  'messages_send',
  'Send a message to a WhatsApp group',
  {
    group_id: z.string().describe('Group JID or group ID'),
    message: z.string().describe('Message content'),
    media_url: z.string().optional().describe('Media URL to attach'),
    connection_id: z.string().optional().describe('Connection ID to use'),
  },
  async (args) => {
    const body = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined));
    return wrap(() => getClient().post('/v1/messages/send', body));
  },
);

server.tool(
  'messages_send_to_campaigns',
  'Send a message to all groups of one or more campaigns',
  {
    campaign_ids: z.array(z.string()).describe('Campaign IDs'),
    message: z.string().describe('Message content'),
    media_url: z.string().optional().describe('Media URL to attach'),
  },
  async (args) => {
    const body = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined));
    return wrap(() => getClient().post('/v1/messages/send-to-campaigns', body));
  },
);

server.tool(
  'messages_bulk',
  'Send bulk messages to multiple groups',
  {
    message: z.string().describe('Message content'),
    group_ids: z.array(z.string()).describe('Group IDs'),
    delay_ms: z.number().optional().describe('Delay between messages in ms (default 1000)'),
  },
  async (args) => {
    const body: any = { message: args.message, group_ids: args.group_ids };
    if (args.delay_ms !== undefined) body.delay_ms = args.delay_ms;
    return wrap(() => getClient().post('/v1/messages/bulk', body));
  },
);

// ========================== CONVERSATIONS ==================================

server.tool(
  'conversations_list',
  'List ZenChat conversations with optional filters',
  {
    status: z.string().optional().describe('Filter by status (open, pending, resolved, snoozed)'),
    assignee_id: z.string().optional().describe('Filter by assignee ID'),
    page: z.number().optional().describe('Page number'),
    per_page: z.number().optional().describe('Results per page'),
  },
  async ({ status, assignee_id, page, per_page }) =>
    wrap(() => getClient().get('/v1/conversations', { status, assignee_id, page, per_page })),
);

server.tool(
  'conversations_get',
  'Get conversation details',
  { id: z.string().describe('Conversation ID') },
  async ({ id }) => wrap(() => getClient().get(`/v1/conversations/${id}`)),
);

server.tool(
  'conversations_messages',
  'List messages in a conversation',
  {
    id: z.string().describe('Conversation ID'),
    cursor: z.string().optional().describe('Pagination cursor'),
    per_page: z.number().optional().describe('Results per page'),
  },
  async ({ id, cursor, per_page }) =>
    wrap(() => getClient().get(`/v1/conversations/${id}/messages`, { cursor, per_page })),
);

server.tool(
  'conversations_reply',
  'Send a message to a conversation',
  {
    id: z.string().describe('Conversation ID'),
    content: z.string().describe('Message content'),
    private: z.boolean().optional().describe('Send as private note (not visible to contact)'),
  },
  async ({ id, content, private: isPrivate }) =>
    wrap(() => getClient().post(`/v1/conversations/${id}/messages`, { content, private: isPrivate ?? false })),
);

// ========================== CONTACTS =======================================

server.tool(
  'contacts_list',
  'List contacts with optional search and filters',
  {
    search: z.string().optional().describe('Search by name, email, or phone'),
    tag: z.string().optional().describe('Filter by tag'),
    page: z.number().optional().describe('Page number'),
    per_page: z.number().optional().describe('Results per page'),
  },
  async ({ search, tag, page, per_page }) =>
    wrap(() => getClient().get('/v1/contacts', { search, tag, page, per_page })),
);

server.tool(
  'contacts_get',
  'Get contact details by ID',
  { id: z.string().describe('Contact ID') },
  async ({ id }) => wrap(() => getClient().get(`/v1/contacts/${id}`)),
);

server.tool(
  'contacts_create',
  'Create a new contact',
  {
    phone_number: z.string().describe('Phone number (e.g. +5511999990000)'),
    name: z.string().optional().describe('Contact name'),
    email: z.string().optional().describe('Contact email'),
    tags: z.array(z.string()).optional().describe('Tags'),
  },
  async (args) => {
    const body = Object.fromEntries(Object.entries(args).filter(([, v]) => v !== undefined));
    return wrap(() => getClient().post('/v1/contacts', body));
  },
);

server.tool(
  'contacts_update',
  'Update a contact',
  {
    id: z.string().describe('Contact ID'),
    name: z.string().optional().describe('New name'),
    email: z.string().optional().describe('New email'),
    tags: z.array(z.string()).optional().describe('New tags (replaces existing)'),
  },
  async ({ id, ...body }) => {
    const filtered = Object.fromEntries(Object.entries(body).filter(([, v]) => v !== undefined));
    return wrap(() => getClient().patch(`/v1/contacts/${id}`, filtered));
  },
);

server.tool(
  'contacts_delete',
  'Delete a contact',
  { id: z.string().describe('Contact ID') },
  async ({ id }) => wrap(() => getClient().del(`/v1/contacts/${id}`)),
);

// ========================== CONNECTIONS ====================================

server.tool(
  'connections_list',
  'List all WhatsApp connections and their status',
  {},
  async () => wrap(() => getClient().get('/v1/connections')),
);

server.tool(
  'connections_get',
  'Get connection details by ID',
  { id: z.string().describe('Connection ID') },
  async ({ id }) => wrap(() => getClient().get(`/v1/connections/${id}`)),
);

// ========================== STATS ==========================================

server.tool(
  'stats_dashboard',
  'Get organization dashboard overview with KPIs',
  {},
  async () => wrap(() => getClient().get('/v1/stats/dashboard')),
);

server.tool(
  'stats_campaign',
  'Get statistics for a specific campaign',
  { id: z.string().describe('Campaign ID') },
  async ({ id }) => wrap(() => getClient().get(`/v1/stats/campaigns/${id}`)),
);

// ========================== ACCESS LIST ====================================

server.tool(
  'access_list_list',
  'List access list (whitelist) entries for a campaign',
  {
    campaign_id: z.string().describe('Campaign ID'),
    page: z.number().optional().describe('Page number'),
    per_page: z.number().optional().describe('Results per page'),
  },
  async ({ campaign_id, page, per_page }) =>
    wrap(() => getClient().get(`/v1/access-list/${campaign_id}`, { page, per_page })),
);

server.tool(
  'access_list_grant',
  'Grant access to a phone number in a campaign',
  {
    campaign_id: z.string().describe('Campaign ID'),
    phone: z.string().describe('Phone number (e.g. 5511999990000)'),
    name: z.string().optional().describe('Buyer name'),
    expires_at: z.string().optional().describe('Expiration date (ISO 8601)'),
  },
  async ({ campaign_id, phone, name, expires_at }) => {
    const body: any = { phone };
    if (name) body.name = name;
    if (expires_at) body.expires_at = expires_at;
    return wrap(() => getClient().post(`/v1/access-list/${campaign_id}`, body));
  },
);

server.tool(
  'access_list_check',
  'Check if a phone number has active access in a campaign',
  {
    campaign_id: z.string().describe('Campaign ID'),
    phone: z.string().describe('Phone number to check'),
  },
  async ({ campaign_id, phone }) =>
    wrap(() => getClient().post(`/v1/access-list/${campaign_id}/check`, { phone })),
);

server.tool(
  'access_list_renew',
  'Renew access for a phone number in a campaign',
  {
    campaign_id: z.string().describe('Campaign ID'),
    phone: z.string().describe('Phone number'),
    expires_at: z.string().describe('New expiration date (ISO 8601)'),
  },
  async ({ campaign_id, phone, expires_at }) =>
    wrap(() => getClient().post(`/v1/access-list/${campaign_id}/renew`, { phone, expires_at })),
);

server.tool(
  'access_list_revoke',
  'Revoke access for a phone number in a campaign',
  {
    campaign_id: z.string().describe('Campaign ID'),
    phone: z.string().describe('Phone number to revoke'),
  },
  async ({ campaign_id, phone }) =>
    wrap(() => getClient().del(`/v1/access-list/${campaign_id}/${phone}`)),
);

server.tool(
  'access_list_stats',
  'Get access list statistics for a campaign',
  { campaign_id: z.string().describe('Campaign ID') },
  async ({ campaign_id }) =>
    wrap(() => getClient().get(`/v1/access-list/${campaign_id}/stats`)),
);

// ========================== BLACKLIST ======================================

server.tool(
  'blacklist_list',
  'List blocked phone numbers',
  {
    page: z.number().optional().describe('Page number'),
    limit: z.number().optional().describe('Results per page'),
  },
  async ({ page, limit }) =>
    wrap(() => getClient().get('/v1/blacklist', { page, limit })),
);

server.tool(
  'blacklist_check',
  'Check if a phone number is blacklisted',
  { phone: z.string().describe('Phone number to check') },
  async ({ phone }) => wrap(() => getClient().get(`/v1/blacklist/check/${phone}`)),
);

server.tool(
  'blacklist_add',
  'Add a phone number to the blacklist',
  {
    phone: z.string().describe('Phone number to block'),
    reason: z.string().optional().describe('Reason for blocking'),
  },
  async ({ phone, reason }) => {
    const body: any = { phone };
    if (reason) body.reason = reason;
    return wrap(() => getClient().post('/v1/blacklist', body));
  },
);

server.tool(
  'blacklist_remove',
  'Remove a phone number from the blacklist',
  { id: z.string().describe('Blacklist entry ID') },
  async ({ id }) => wrap(() => getClient().del(`/v1/blacklist/${id}`)),
);

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('MCP server failed to start:', err);
  process.exit(1);
});
