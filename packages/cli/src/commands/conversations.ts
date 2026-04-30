import { Command } from 'commander';
import { ZenHubClient } from '@zenhub/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerConversations(program: Command, client: ZenHubClient) {
  const cmd = program.command('conversations').alias('chat').description('ZenChat conversations');

  cmd
    .command('list')
    .description('List conversations')
    .option('-s, --status <status>', 'Filter by status (open, pending, resolved, snoozed)')
    .option('-a, --assignee <id>', 'Filter by assignee ID')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get('/v1/conversations', {
        status: opts.status,
        assignee_id: opts.assignee,
        page: opts.page,
        per_page: opts.perPage,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <id>')
    .description('Get conversation details')
    .action(async (id) => {
      const res = await client.get(`/v1/conversations/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('messages <id>')
    .description('List messages in a conversation')
    .option('--cursor <cursor>', 'Pagination cursor')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (id, opts) => {
      const res = await client.get(`/v1/conversations/${id}/messages`, {
        cursor: opts.cursor,
        per_page: opts.perPage,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('reply <id>')
    .description('Send a message to a conversation')
    .requiredOption('-m, --message <text>', 'Message content')
    .option('--private', 'Send as private note (not visible to contact)')
    .action(async (id, opts) => {
      const body: any = {
        content: opts.message,
        private: opts.private || false,
      };
      const res = await client.post(`/v1/conversations/${id}/messages`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Reply sent', res.data);
    });
}
