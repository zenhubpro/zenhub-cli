import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError } from '../lib/output';
import { downloadFile } from '../lib/download';

const REPORTING_SLUGS = ['deals', 'appointments', 'tickets-by-channel', 'workflows', 'top-tags', 'summary'];

export function registerZenChat(program: Command, client: ZenHubClient) {
  const cmd = program.command('zenchat').description('ZenChat sales, pipelines, and reporting');

  // --- sales ---
  const sales = cmd.command('sales').description('ZenChat sales metrics');

  sales
    .command('overview')
    .description('Get sales overview')
    .option('--start <date>', 'Start date (ISO 8601)')
    .option('--end <date>', 'End date (ISO 8601)')
    .option('--granularity <granularity>', 'day, week, or month')
    .action(async (opts) => {
      const res = await client.get('/v1/zenchat/sales/overview', {
        start: opts.start,
        end: opts.end,
        granularity: opts.granularity,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  sales
    .command('list')
    .description('List sales')
    .option('--start <date>', 'Start date (ISO 8601)')
    .option('--end <date>', 'End date (ISO 8601)')
    .option('--gateway <gateway>', 'Filter by payment gateway')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get('/v1/zenchat/sales', {
        start: opts.start,
        end: opts.end,
        gateway: opts.gateway,
        page: opts.page,
        per_page: opts.perPage,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  // --- pipeline ---
  const pipeline = cmd.command('pipeline').description('ZenChat sales pipelines');

  pipeline
    .command('metrics <id>')
    .description('Get metrics for a sales pipeline')
    .action(async (id) => {
      const res = await client.get(`/v1/zenchat/pipelines/${id}/metrics`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  // --- reporting ---
  const reporting = cmd.command('reporting').description('ZenChat reporting');

  for (const slug of REPORTING_SLUGS) {
    reporting
      .command(slug)
      .description(`Get ${slug.replace(/-/g, ' ')} report`)
      .requiredOption('--start-date <date>', 'Start date (ISO 8601)')
      .requiredOption('--end-date <date>', 'End date (ISO 8601)')
      .option('--granularity <granularity>', 'day, week, or month')
      .option('--timezone <tz>', 'IANA timezone (default America/Sao_Paulo)')
      .option('-p, --page <number>', 'Page number')
      .option('-l, --per-page <number>', 'Results per page (max 200)')
      .action(async (opts) => {
        const res = await client.get(`/v1/zenchat/reporting/${slug}`, {
          start_date: opts.startDate,
          end_date: opts.endDate,
          granularity: opts.granularity,
          timezone: opts.timezone,
          page: opts.page,
          perPage: opts.perPage,
        });
        if (!res.success) return outputError(res.error!);
        output(res.data);
      });
  }

  reporting
    .command('export')
    .description('Export a reporting dataset as CSV')
    .requiredOption('--start-date <date>', 'Start date (ISO 8601)')
    .requiredOption('--end-date <date>', 'End date (ISO 8601)')
    .requiredOption(
      '--dataset <dataset>',
      'overview, agents, deals, appointments, channels, workflows, or tags',
    )
    .option('--timezone <tz>', 'IANA timezone (default America/Sao_Paulo)')
    .option('-o, --output <path>', 'Save to file instead of printing to stdout')
    .action(async (opts) => {
      await downloadFile(
        '/v1/zenchat/reporting/export',
        {
          start_date: opts.startDate,
          end_date: opts.endDate,
          dataset: opts.dataset,
          timezone: opts.timezone,
          format: 'csv',
        },
        opts.output,
      );
    });
}
