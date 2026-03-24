import { Command } from 'commander';
import { ZenHubClient } from '../lib/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerAccessList(program: Command, client: ZenHubClient) {
  const cmd = program.command('access-list').alias('acl').description('Campaign access list (whitelist)');

  cmd
    .command('list <campaignId>')
    .description('List access list entries for a campaign')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --limit <number>', 'Results per page', '20')
    .action(async (campaignId, opts) => {
      const res = await client.get(`/v1/access-list/${campaignId}`, { page: opts.page, limit: opts.limit });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('grant <campaignId>')
    .description('Grant access to a phone number')
    .requiredOption('--phone <phone>', 'Phone number (e.g. 5511999990000)')
    .option('--name <name>', 'Buyer name')
    .option('--expires <date>', 'Expiration date (ISO 8601)')
    .action(async (campaignId, opts) => {
      const body: any = { phone: opts.phone };
      if (opts.name) body.name = opts.name;
      if (opts.expires) body.expires_at = opts.expires;
      const res = await client.post(`/v1/access-list/${campaignId}`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Access granted', res.data);
    });

  cmd
    .command('check <campaignId> <phone>')
    .description('Check if a phone number has active access')
    .action(async (campaignId, phone) => {
      const res = await client.post(`/v1/access-list/${campaignId}/check`, { phone });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('renew <campaignId>')
    .description('Renew access for a phone number')
    .requiredOption('--phone <phone>', 'Phone number')
    .requiredOption('--expires <date>', 'New expiration date (ISO 8601)')
    .action(async (campaignId, opts) => {
      const res = await client.post(`/v1/access-list/${campaignId}/renew`, {
        phone: opts.phone,
        expires_at: opts.expires,
      });
      if (!res.success) return outputError(res.error!);
      outputSuccess('Access renewed', res.data);
    });

  cmd
    .command('revoke <campaignId> <phone>')
    .description('Revoke access for a phone number')
    .action(async (campaignId, phone) => {
      const res = await client.del(`/v1/access-list/${campaignId}/${phone}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Access revoked');
    });

  cmd
    .command('stats <campaignId>')
    .description('Get access list statistics')
    .action(async (campaignId) => {
      const res = await client.get(`/v1/access-list/${campaignId}/stats`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
