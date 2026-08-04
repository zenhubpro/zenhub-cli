import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { downloadFile } from '../lib/download';

export function registerPolls(program: Command, client: ZenHubClient) {
  const cmd = program.command('polls').description('WhatsApp polls');

  cmd
    .command('export <id>')
    .description('Export poll results as CSV')
    .option('-o, --output <path>', 'Save to file instead of printing to stdout')
    .action(async (id, opts) => {
      await downloadFile(`/v1/polls/${id}/export`, {}, opts.output);
    });
}
