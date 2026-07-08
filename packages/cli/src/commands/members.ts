import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError } from '../lib/output';

export function registerMembers(program: Command, client: ZenHubClient) {
  const cmd = program.command('members').description('Member lookup across campaigns/groups');

  cmd
    .command('lookup <phone>')
    .description(
      'Find which campaigns/groups a phone belongs to. ' +
        'Pass the phone WITH country code (e.g. 5562986292000).',
    )
    .action(async (phone) => {
      const res = await client.get(`/v1/members/lookup/${phone}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
