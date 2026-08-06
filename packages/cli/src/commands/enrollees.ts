import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError } from '../lib/output';

export function registerEnrollees(program: Command, client: ZenHubClient) {
  const cmd = program.command('enrollees').description('View enrollees');

  cmd
    .command('list')
    .description('List enrollees')
    .option('-p, --page <number>', 'Page number')
    .option('-l, --limit <number>', 'Limit')
    .option('-s, --search <text>', 'Search query')
    .option('--status <status>', 'Filter by status')
    .action(async (opts) => {
      const res = await client.get('/v1/enrollees', {
        page: opts.page,
        limit: opts.limit,
        search: opts.search,
        status: opts.status,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('stats')
    .description('Get enrollee statistics')
    .action(async () => {
      const res = await client.get('/v1/enrollees/stats');
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
