import { Command } from 'commander';
import { ZenHubClient } from '@zenhub/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerContacts(program: Command, client: ZenHubClient) {
  const cmd = program.command('contacts').description('Manage contacts');

  cmd
    .command('list')
    .description('List contacts')
    .option('-q, --query <search>', 'Search by name, email, or phone')
    .option('-t, --tag <tag>', 'Filter by tag')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get('/v1/contacts', {
        search: opts.query,
        tag: opts.tag,
        page: opts.page,
        per_page: opts.perPage,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <id>')
    .description('Get contact details')
    .action(async (id) => {
      const res = await client.get(`/v1/contacts/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('create')
    .description('Create a new contact')
    .requiredOption('--phone <phone>', 'Phone number (e.g. +5511999990000)')
    .option('-n, --name <name>', 'Contact name')
    .option('-e, --email <email>', 'Contact email')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async (opts) => {
      const body: any = { phone_number: opts.phone };
      if (opts.name) body.name = opts.name;
      if (opts.email) body.email = opts.email;
      if (opts.tags) body.tags = opts.tags.split(',').map((t: string) => t.trim());
      const res = await client.post('/v1/contacts', body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Contact created', res.data);
    });

  cmd
    .command('update <id>')
    .description('Update a contact')
    .option('-n, --name <name>', 'New name')
    .option('-e, --email <email>', 'New email')
    .option('--tags <tags>', 'New tags (comma-separated, replaces existing)')
    .action(async (id, opts) => {
      const body: any = {};
      if (opts.name) body.name = opts.name;
      if (opts.email) body.email = opts.email;
      if (opts.tags) body.tags = opts.tags.split(',').map((t: string) => t.trim());
      const res = await client.patch(`/v1/contacts/${id}`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Contact updated', res.data);
    });

  cmd
    .command('delete <id>')
    .description('Delete a contact')
    .action(async (id) => {
      const res = await client.del(`/v1/contacts/${id}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Contact deleted');
    });
}
