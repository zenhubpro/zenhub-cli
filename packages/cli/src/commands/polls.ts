import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError } from '../lib/output';
import { downloadFile } from '../lib/download';

export function registerPolls(program: Command, client: ZenHubClient) {
  const cmd = program.command('polls').description('WhatsApp polls');

  cmd
    .command('list')
    .description('List polls')
    .option('-g, --group <id>', 'Filter by group ID')
    .option('-p, --page <number>', 'Page number')
    .option('-l, --per-page <number>', 'Results per page')
    .action(async (opts) => {
      const res = await client.get('/v1/polls', {
        group_id: opts.group,
        page: opts.page,
        per_page: opts.perPage,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <pollId>')
    .description('Get poll details by ID')
    .action(async (pollId) => {
      const res = await client.get(`/v1/polls/${pollId}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('by-group <groupId>')
    .description('List polls for a group')
    .action(async (groupId) => {
      const res = await client.get(`/v1/polls/group/${groupId}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('export <id>')
    .description('Export poll results as CSV')
    .option('-o, --output <path>', 'Save to file instead of printing to stdout')
    .action(async (id, opts) => {
      await downloadFile(`/v1/polls/${id}/export`, {}, opts.output);
    });
}
