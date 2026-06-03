import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError, outputSuccess } from '../lib/output';

export function registerCampaigns(program: Command, client: ZenHubClient) {
  const cmd = program.command('campaigns').description('Manage campaigns');

  cmd
    .command('list')
    .description('List all campaigns')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get('/v1/campaigns', { page: opts.page, per_page: opts.perPage });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <id>')
    .description('Get campaign details by ID')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('create')
    .description('Create a new campaign')
    .requiredOption('-n, --name <name>', 'Campaign name')
    .option('--description <text>', 'Campaign description')
    .option('--connection <id>', 'Primary WhatsApp connection ID')
    .option('--distribution-mode <mode>', 'Distribution mode: sequential or random')
    .option('--auto-create', 'Enable auto-creation of groups')
    .option('--no-auto-create', 'Disable auto-creation of groups')
    .option('--member-limit <number>', 'Default member limit per group')
    .option('--color <hex>', 'Invite page primary color (hex, e.g. #f97316)')
    .option('--connections <ids>', 'Comma-separated selected connection UUIDs')
    .option('--access-list', 'Enable access list (whitelist)')
    .option('--max-open-groups <number>', 'Maximum number of open groups')
    .action(async (opts) => {
      const body: Record<string, any> = {
        name: opts.name,
      };

      if (opts.description) body.description = opts.description;
      if (opts.connection) body.primary_connection_id = opts.connection;
      if (opts.distributionMode) body.distribution_mode = opts.distributionMode;
      if (opts.autoCreate === true) body.auto_create_groups = true;
      if (opts.autoCreate === false) body.auto_create_groups = false;
      if (opts.memberLimit) body.default_member_limit = Number(opts.memberLimit);
      if (opts.color) body.invite_primary_color = opts.color;
      if (opts.connections) body.selected_connections = opts.connections.split(',').map((c: string) => c.trim());
      if (opts.accessList) body.access_list_enabled = true;
      if (opts.maxOpenGroups) body.max_open_groups = Number(opts.maxOpenGroups);

      const res = await client.post('/v1/campaigns', body);
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Campaign "${opts.name}" created`, res.data);
    });

  cmd
    .command('update <id>')
    .description('Update a campaign')
    .option('-n, --name <name>', 'New name')
    .option('--description <text>', 'New description')
    .option('--active <bool>', 'Activate/deactivate')
    .option('--distribution-mode <mode>', 'Distribution mode: sequential or random')
    .option('--auto-create', 'Enable auto-creation of groups')
    .option('--no-auto-create', 'Disable auto-creation of groups')
    .option('--member-limit <number>', 'Default member limit per group')
    .option('--color <hex>', 'Invite page primary color (hex)')
    .option('--connections <ids>', 'Comma-separated selected connection UUIDs')
    .option('--access-list', 'Enable access list (whitelist)')
    .option('--no-access-list', 'Disable access list')
    .option('--max-open-groups <number>', 'Maximum number of open groups')
    .action(async (id, opts) => {
      const body: Record<string, any> = {};
      if (opts.name) body.name = opts.name;
      if (opts.description) body.description = opts.description;
      if (opts.active !== undefined) body.is_active = opts.active === 'true';
      if (opts.distributionMode) body.distribution_mode = opts.distributionMode;
      if (opts.autoCreate === true) body.auto_create_groups = true;
      if (opts.autoCreate === false) body.auto_create_groups = false;
      if (opts.memberLimit) body.default_member_limit = Number(opts.memberLimit);
      if (opts.color) body.invite_primary_color = opts.color;
      if (opts.connections) body.selected_connections = opts.connections.split(',').map((c: string) => c.trim());
      if (opts.accessList === true) body.access_list_enabled = true;
      if (opts.accessList === false) body.access_list_enabled = false;
      if (opts.maxOpenGroups) body.max_open_groups = Number(opts.maxOpenGroups);

      const res = await client.patch(`/v1/campaigns/${id}`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Campaign updated', res.data);
    });

  cmd
    .command('delete <id>')
    .description('Delete a campaign')
    .action(async (id) => {
      const res = await client.del(`/v1/campaigns/${id}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Campaign deleted');
    });

  cmd
    .command('stats <id>')
    .description('Get campaign statistics')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}/stats`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('execute <id>')
    .description('Execute campaign immediately')
    .action(async (id) => {
      const res = await client.post(`/v1/campaigns/${id}/execute`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Campaign execution started', res.data);
    });

  cmd
    .command('members <id>')
    .description('List campaign members')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}/members`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get-invite <id>')
    .description('Get campaign invite settings')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}/invite-settings`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('update-invite <id>')
    .description('Update campaign invite settings')
    .option('--slug <slug>', 'Invite slug')
    .option('--distribution-mode <mode>', 'Distribution mode')
    .option('--color <hex>', 'Invite primary color')
    .option('--title <title>', 'Invite title')
    .option('--description <text>', 'Invite description')
    .option('--redirect-cookie', 'Enable redirect cookie')
    .option('--no-redirect-cookie', 'Disable redirect cookie')
    .option('--pixel <id>', 'Meta pixel ID')
    .action(async (id, opts) => {
      const body: Record<string, any> = {};
      if (opts.slug) body.slug = opts.slug;
      if (opts.distributionMode) body.distribution_mode = opts.distributionMode;
      if (opts.color) body.invite_primary_color = opts.color;
      if (opts.title) body.invite_title = opts.title;
      if (opts.description) body.invite_description = opts.description;
      if (opts.redirectCookie === true) body.redirect_cookie_enabled = true;
      if (opts.redirectCookie === false) body.redirect_cookie_enabled = false;
      if (opts.pixel) body.meta_pixel_id = opts.pixel;
      const res = await client.patch(`/v1/campaigns/${id}/invite-settings`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Invite settings updated', res.data);
    });

  cmd
    .command('engagement <id>')
    .description('Get campaign engagement analytics')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}/analytics/engagement`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('member-timeline <id>')
    .description('Get campaign member timeline')
    .option('--start <date>', 'Start date')
    .option('--end <date>', 'End date')
    .action(async (id, opts) => {
      const res = await client.get(`/v1/campaigns/${id}/analytics/member-timeline`, {
        start: opts.start,
        end: opts.end,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('admins <id>')
    .description('List campaign admins')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}/admins`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('admin-status <id>')
    .description('Get campaign admin status')
    .action(async (id) => {
      const res = await client.get(`/v1/campaigns/${id}/admin-status`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('admin-remove <id> <adminId>')
    .description('Remove a campaign admin')
    .action(async (id, adminId) => {
      const res = await client.del(`/v1/campaigns/${id}/admins/${adminId}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Admin removed');
    });
}
