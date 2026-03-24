import { Command } from 'commander';
import { ZenHubClient } from '../lib/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerSchedules(program: Command, client: ZenHubClient) {
  const cmd = program.command('schedules').description('Manage message schedules');

  cmd
    .command('list')
    .description('List schedules')
    .option('-c, --campaign <id>', 'Filter by campaign ID')
    .option('-s, --status <status>', 'Filter by status (pending, sent, failed)')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get('/v1/schedules', {
        campaign_id: opts.campaign,
        status: opts.status,
        page: opts.page,
        per_page: opts.perPage,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <id>')
    .description('Get schedule details')
    .action(async (id) => {
      const res = await client.get(`/v1/schedules/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('create')
    .description('Create a new schedule')
    .requiredOption('-c, --campaign <id>', 'Campaign ID')
    .requiredOption('-m, --message <text>', 'Message content')
    .requiredOption('-d, --date <datetime>', 'Scheduled datetime (ISO 8601, e.g. 2026-03-25T10:00:00)')
    .option('--group <id>', 'Target specific group ID')
    .option('--media <url>', 'Media URL to attach')
    .action(async (opts) => {
      const body: any = {
        campaign_id: opts.campaign,
        message: opts.message,
        scheduled_at: opts.date,
      };
      if (opts.group) body.group_id = opts.group;
      if (opts.media) body.media_url = opts.media;
      const res = await client.post('/v1/schedules', body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule created', res.data);
    });

  cmd
    .command('update <id>')
    .description('Update a schedule')
    .option('-m, --message <text>', 'New message content')
    .option('-d, --date <datetime>', 'New datetime (ISO 8601)')
    .action(async (id, opts) => {
      const body: any = {};
      if (opts.message) body.message = opts.message;
      if (opts.date) body.scheduled_at = opts.date;
      const res = await client.patch(`/v1/schedules/${id}`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule updated', res.data);
    });

  cmd
    .command('delete <id>')
    .description('Delete a schedule')
    .action(async (id) => {
      const res = await client.del(`/v1/schedules/${id}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule deleted');
    });
}
