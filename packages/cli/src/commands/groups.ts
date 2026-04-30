import { Command } from 'commander';
import { ZenHubClient } from '@zenhub/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerGroups(program: Command, client: ZenHubClient) {
  const cmd = program.command('groups').description('Manage WhatsApp groups');

  cmd
    .command('list')
    .description('List groups')
    .option('-c, --campaign <id>', 'Filter by campaign ID')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get('/v1/groups', {
        campaign_id: opts.campaign,
        page: opts.page,
        per_page: opts.perPage,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <id>')
    .description('Get group details by ID')
    .action(async (id) => {
      const res = await client.get(`/v1/groups/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('members <campaignId> <groupId>')
    .description('List members of a group in a campaign')
    .action(async (campaignId, groupId) => {
      const res = await client.get(`/v1/campaigns/${campaignId}/groups/${groupId}/members`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('create <campaignId>')
    .description('Create a new group in a campaign')
    .requiredOption('-n, --name <name>', 'Group name')
    .option('--limit <number>', 'Member limit')
    .action(async (campaignId, opts) => {
      const body: any = { name: opts.name };
      if (opts.limit) body.member_limit = Number(opts.limit);
      const res = await client.post(`/v1/campaigns/${campaignId}/groups`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Group "${opts.name}" created`, res.data);
    });

  cmd
    .command('add-member <campaignId> <groupId>')
    .description('Add members to a group')
    .requiredOption('--phones <phones>', 'Comma-separated phone numbers (e.g. 5511999990000,5511888880000)')
    .action(async (campaignId, groupId, opts) => {
      const phones = opts.phones.split(',').map((p: string) => p.trim());
      const res = await client.post(`/v1/campaigns/${campaignId}/groups/${groupId}/members`, { phones });
      if (!res.success) return outputError(res.error!);
      outputSuccess(`${phones.length} member(s) added`, res.data);
    });

  cmd
    .command('remove-member <campaignId> <groupId> <phone>')
    .description('Remove a member from a group')
    .action(async (campaignId, groupId, phone) => {
      const res = await client.del(`/v1/campaigns/${campaignId}/groups/${groupId}/members/${phone}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Member removed');
    });

  cmd
    .command('sync-members <campaignId>')
    .description('Sync members of all groups in a campaign')
    .action(async (campaignId) => {
      const res = await client.post(`/v1/campaigns/${campaignId}/sync-members`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Member sync started', res.data);
    });

  // --- Group management convenience commands ---
  // These create immediate schedules via the schedules API

  cmd
    .command('rename <campaignId> <groupId>')
    .description('Rename a group (creates an immediate schedule with execution_type=change_name)')
    .requiredOption('-n, --name <name>', 'New group name')
    .action(async (campaignId, groupId, opts) => {
      const body = {
        name: `Rename group to "${opts.name}"`,
        execution_type: 'change_name',
        scheduled_date: new Date().toISOString(),
        group_ids: [groupId],
        new_group_name: opts.name,
        execute_now: true,
      };
      const res = await client.post(`/v1/campaigns/${campaignId}/schedules`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Group rename to "${opts.name}" scheduled`, res.data);
    });

  cmd
    .command('lock <campaignId> <groupId>')
    .description('Lock a group (only admins can send messages)')
    .action(async (campaignId, groupId) => {
      const body = {
        name: 'Lock group',
        execution_type: 'lock_group',
        scheduled_date: new Date().toISOString(),
        group_ids: [groupId],
        execute_now: true,
      };
      const res = await client.post(`/v1/campaigns/${campaignId}/schedules`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Group lock scheduled', res.data);
    });

  cmd
    .command('unlock <campaignId> <groupId>')
    .description('Unlock a group (all members can send messages)')
    .action(async (campaignId, groupId) => {
      const body = {
        name: 'Unlock group',
        execution_type: 'unlock_group',
        scheduled_date: new Date().toISOString(),
        group_ids: [groupId],
        execute_now: true,
      };
      const res = await client.post(`/v1/campaigns/${campaignId}/schedules`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Group unlock scheduled', res.data);
    });
}
