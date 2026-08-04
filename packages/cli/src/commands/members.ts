import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError } from '../lib/output';

export function registerMembers(program: Command, client: ZenHubClient) {
  const cmd = program.command('members').description('Member lookups');

  cmd
    .command('lookup <phone>')
    .description('Look up a member by phone number across campaigns/groups')
    .action(async (phone) => {
      const res = await client.get(`/v1/members/lookup/${phone}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
