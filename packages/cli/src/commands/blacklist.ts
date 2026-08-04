import { Command } from 'commander';
import { readFileSync } from 'fs';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerBlacklist(program: Command, client: ZenHubClient) {
  const cmd = program.command('blacklist').description('Blocked numbers management');

  cmd
    .command('list')
    .description('List blocked numbers')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --limit <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get('/v1/blacklist', { page: opts.page, limit: opts.limit });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('check <phone>')
    .description('Check if a number is blacklisted')
    .action(async (phone) => {
      const res = await client.get(`/v1/blacklist/check/${phone}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('add')
    .description('Add a number to the blacklist')
    .requiredOption('--phone <phone>', 'Phone number')
    .option('--reason <reason>', 'Reason for blocking')
    .action(async (opts) => {
      const res = await client.post('/v1/blacklist', { phone: opts.phone, reason: opts.reason });
      if (!res.success) return outputError(res.error!);
      outputSuccess('Number blocked', res.data);
    });

  cmd
    .command('remove <id>')
    .description('Remove a number from the blacklist')
    .action(async (id) => {
      const res = await client.del(`/v1/blacklist/${id}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Number unblocked');
    });

  cmd
    .command('bulk [phones...]')
    .description('Block multiple numbers at once')
    .option('--file <path>', 'File with one phone number per line')
    .option('--reason <reason>', 'Reason applied to all numbers')
    .action(async (phones: string[], opts) => {
      const phoneNumbers = [...phones];

      if (opts.file) {
        const lines = readFileSync(opts.file, 'utf-8')
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        phoneNumbers.push(...lines);
      }

      if (phoneNumbers.length === 0) {
        return outputError('No phones provided (pass as arguments or --file)');
      }

      const body: any = { phone_numbers: phoneNumbers };
      if (opts.reason) body.reason = opts.reason;

      const res = await client.post('/v1/blacklist/bulk', body);
      if (!res.success) return outputError(res.error!);
      outputSuccess(`${phoneNumbers.length} number(s) submitted for blocking`, res.data);
    });
}
