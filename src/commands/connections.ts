import { Command } from 'commander';
import { ZenHubClient } from '../lib/client';
import { output, outputError } from '../lib/output';

export function registerConnections(program: Command, client: ZenHubClient) {
  const cmd = program.command('connections').description('WhatsApp connections');

  cmd
    .command('list')
    .description('List all WhatsApp connections and their status')
    .action(async () => {
      const res = await client.get('/v1/connections');
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <id>')
    .description('Get connection details')
    .action(async (id) => {
      const res = await client.get(`/v1/connections/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
