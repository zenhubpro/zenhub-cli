import { Command } from 'commander';
import { ZenHubClient } from '@zenhub/client';
import { output, outputError } from '../lib/output';

export function registerStats(program: Command, client: ZenHubClient) {
  const cmd = program.command('stats').description('Dashboard and analytics');

  cmd
    .command('dashboard')
    .description('Get organization dashboard overview')
    .action(async () => {
      const res = await client.get('/v1/stats/dashboard');
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('campaign <id>')
    .description('Get statistics for a specific campaign')
    .action(async (id) => {
      const res = await client.get(`/v1/stats/campaigns/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
