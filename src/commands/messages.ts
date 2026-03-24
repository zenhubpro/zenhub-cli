import { Command } from 'commander';
import { ZenHubClient } from '../lib/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerMessages(program: Command, client: ZenHubClient) {
  const cmd = program.command('messages').description('Send WhatsApp messages');

  cmd
    .command('send')
    .description('Send a message to a group')
    .requiredOption('-g, --group <id>', 'Group JID or group ID')
    .requiredOption('-m, --message <text>', 'Message content')
    .option('--media <url>', 'Media URL to attach')
    .option('--connection <id>', 'Connection ID to use')
    .action(async (opts) => {
      const body: any = {
        group_id: opts.group,
        message: opts.message,
      };
      if (opts.media) body.media_url = opts.media;
      if (opts.connection) body.connection_id = opts.connection;
      const res = await client.post('/v1/messages/send', body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Message sent', res.data);
    });

  cmd
    .command('send-to-campaigns')
    .description('Send a message to all groups of one or more campaigns')
    .requiredOption('-c, --campaigns <ids>', 'Comma-separated campaign IDs')
    .requiredOption('-m, --message <text>', 'Message content')
    .option('--media <url>', 'Media URL to attach')
    .action(async (opts) => {
      const campaignIds = opts.campaigns.split(',').map((c: string) => c.trim());
      const body: any = {
        campaign_ids: campaignIds,
        message: opts.message,
      };
      if (opts.media) body.media_url = opts.media;
      const res = await client.post('/v1/messages/send-to-campaigns', body);
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Message sent to ${campaignIds.length} campaign(s)`, res.data);
    });

  cmd
    .command('bulk')
    .description('Send bulk messages')
    .requiredOption('-m, --message <text>', 'Message content')
    .requiredOption('--groups <ids>', 'Comma-separated group IDs')
    .option('--delay <ms>', 'Delay between messages in ms', '1000')
    .action(async (opts) => {
      const groupIds = opts.groups.split(',').map((g: string) => g.trim());
      const res = await client.post('/v1/messages/bulk', {
        message: opts.message,
        group_ids: groupIds,
        delay_ms: Number(opts.delay),
      });
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Bulk send queued for ${groupIds.length} groups`, res.data);
    });
}
