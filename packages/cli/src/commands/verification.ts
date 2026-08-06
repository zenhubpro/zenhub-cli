import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerVerification(program: Command, client: ZenHubClient) {
  const cmd = program.command('verification').description('Verification rules and actions');

  const rules = cmd.command('rules').description('Manage verification rules');

  rules
    .command('list')
    .description('List verification rules')
    .option('-l, --limit <number>', 'Limit')
    .option('-o, --offset <number>', 'Offset')
    .option('--active-only', 'Only active rules')
    .action(async (opts) => {
      const res = await client.get('/v1/verification-rules', {
        limit: opts.limit,
        offset: opts.offset,
        active_only: opts.activeOnly,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  rules
    .command('get <id>')
    .description('Get a verification rule by ID')
    .action(async (id) => {
      const res = await client.get(`/v1/verification-rules/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  rules
    .command('toggle <id>')
    .description('Toggle a verification rule active/inactive')
    .action(async (id) => {
      const res = await client.patch(`/v1/verification-rules/${id}/toggle`, {});
      if (!res.success) return outputError(res.error!);
      outputSuccess('Verification rule toggled', res.data);
    });

  rules
    .command('delete <id>')
    .description('Delete a verification rule')
    .action(async (id) => {
      const res = await client.del(`/v1/verification-rules/${id}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Verification rule deleted');
    });

  cmd
    .command('verify-now <campaignId>')
    .description('Run verification now for a campaign')
    .action(async (campaignId) => {
      const res = await client.post(`/v1/verification-rules/campaigns/${campaignId}/verify-now`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Verification started', res.data);
    });

  const actions = cmd.command('actions').description('View verification actions');

  actions
    .command('list')
    .description('List verification actions')
    .option('--status <status>', 'Filter by status')
    .option('--action-type <type>', 'Filter by action type')
    .option('--trigger-type <type>', 'Filter by trigger type')
    .option('--start-date <date>', 'Start date')
    .option('--end-date <date>', 'End date')
    .option('--phone <phone>', 'Filter by phone')
    .option('-l, --limit <number>', 'Limit')
    .option('-o, --offset <number>', 'Offset')
    .action(async (opts) => {
      const res = await client.get('/v1/verification-actions', {
        status: opts.status,
        action_type: opts.actionType,
        trigger_type: opts.triggerType,
        start_date: opts.startDate,
        end_date: opts.endDate,
        phone: opts.phone,
        limit: opts.limit,
        offset: opts.offset,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  actions
    .command('stats')
    .description('Get verification action statistics')
    .option('--start-date <date>', 'Start date')
    .option('--end-date <date>', 'End date')
    .action(async (opts) => {
      const res = await client.get('/v1/verification-actions/stats', {
        start_date: opts.startDate,
        end_date: opts.endDate,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
