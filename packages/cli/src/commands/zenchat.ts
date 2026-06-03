import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError } from '../lib/output';

export function registerZenchat(program: Command, client: ZenHubClient) {
  const cmd = program.command('zenchat').description('ZenChat inbox analytics');

  const reporting = cmd.command('reporting').description('ZenChat reporting');

  reporting
    .command('overview')
    .description('Reporting overview')
    .requiredOption('--start-date <date>', 'Start date')
    .requiredOption('--end-date <date>', 'End date')
    .action(async (opts) => {
      const res = await client.get('/v1/zenchat/reporting/overview', {
        start_date: opts.startDate,
        end_date: opts.endDate,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  reporting
    .command('conversation-volume')
    .description('Conversation volume over time')
    .requiredOption('--start-date <date>', 'Start date')
    .requiredOption('--end-date <date>', 'End date')
    .option('--group-by <unit>', 'Group by: day, week, or month')
    .action(async (opts) => {
      const res = await client.get('/v1/zenchat/reporting/conversation-volume', {
        start_date: opts.startDate,
        end_date: opts.endDate,
        group_by: opts.groupBy,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  reporting
    .command('response-time')
    .description('Response time metrics')
    .requiredOption('--start-date <date>', 'Start date')
    .requiredOption('--end-date <date>', 'End date')
    .action(async (opts) => {
      const res = await client.get('/v1/zenchat/reporting/response-time', {
        start_date: opts.startDate,
        end_date: opts.endDate,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  reporting
    .command('resolution-time')
    .description('Resolution time metrics')
    .requiredOption('--start-date <date>', 'Start date')
    .requiredOption('--end-date <date>', 'End date')
    .action(async (opts) => {
      const res = await client.get('/v1/zenchat/reporting/resolution-time', {
        start_date: opts.startDate,
        end_date: opts.endDate,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  reporting
    .command('agent-performance')
    .description('Agent performance metrics')
    .requiredOption('--start-date <date>', 'Start date')
    .requiredOption('--end-date <date>', 'End date')
    .action(async (opts) => {
      const res = await client.get('/v1/zenchat/reporting/agent-performance', {
        start_date: opts.startDate,
        end_date: opts.endDate,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
