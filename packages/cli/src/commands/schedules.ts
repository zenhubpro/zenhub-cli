import { readFileSync } from 'fs';
import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError, outputSuccess } from '../lib/output';

// Parse a CSV file into schedule objects. Header row defines keys. Multi-value
// fields (group_ids, poll_options) use `|` as separator to avoid clashing with
// the CSV comma. Empty cells are skipped.
function parseSchedulesCsv(text: string): Record<string, any>[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const MULTI = new Set(['group_ids', 'poll_options']);
  const NUM = new Set(['delay_between_groups']);
  return lines.slice(1).map((line) => {
    const cells = line.split(',');
    const row: Record<string, any> = {};
    headers.forEach((key, i) => {
      const raw = (cells[i] ?? '').trim();
      if (!raw) return;
      if (MULTI.has(key)) row[key] = raw.split('|').map((v) => v.trim()).filter(Boolean);
      else if (NUM.has(key)) row[key] = Number(raw);
      else row[key] = raw;
    });
    return row;
  });
}

const EXECUTION_TYPES = [
  'text', 'image', 'video', 'audio', 'document', 'poll',
  'change_name', 'change_description', 'change_photo',
  'lock_group', 'unlock_group', 'promote_admin', 'demote_admin',
  'multiple',
] as const;

export function registerSchedules(program: Command, client: ZenHubClient) {
  const cmd = program.command('schedules').description('Manage message schedules');

  cmd
    .command('list')
    .description('List schedules for a campaign')
    .requiredOption('-c, --campaign <id>', 'Campaign ID')
    .option('-s, --status <status>', 'Filter by status (pending, sent, failed)')
    .option('-p, --page <number>', 'Page number', '1')
    .option('-l, --per-page <number>', 'Results per page', '20')
    .action(async (opts) => {
      const res = await client.get(`/v1/campaigns/${opts.campaign}/schedules`, {
        status: opts.status,
        page: opts.page,
        per_page: opts.perPage,
      });
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('get <scheduleId>')
    .description('Get schedule details')
    .requiredOption('-c, --campaign <id>', 'Campaign ID')
    .action(async (scheduleId, opts) => {
      const res = await client.get(`/v1/campaigns/${opts.campaign}/schedules/${scheduleId}`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('create')
    .description('Create a new schedule')
    .requiredOption('-n, --name <name>', 'Schedule name')
    .requiredOption('-t, --type <type>', `Execution type: ${EXECUTION_TYPES.join(', ')}`)
    .requiredOption('-c, --campaign <id>', 'Campaign ID')
    .requiredOption('-d, --date <datetime>', 'Scheduled datetime (ISO 8601, e.g. 2026-03-25T10:00:00)')
    .requiredOption('-g, --groups <ids>', 'Comma-separated group JIDs (or __ALL__ for all groups)')
    .option('-m, --message <text>', 'Message content')
    .option('--media <url>', 'Media URL to attach')
    .option('--media-name <filename>', 'Media filename')
    .option('--media-mime <mimetype>', 'Media MIME type')
    .option('--mention-all', 'Mention all group members')
    .option('--poll-question <question>', 'Poll question (for type=poll)')
    .option('--poll-options <options>', 'Comma-separated poll options (for type=poll)')
    .option('--additional-message <text>', 'Additional message (for type=multiple)')
    .option('--message-order <order>', 'Message order: media_first or message_first')
    .option('--delay <seconds>', 'Delay between groups in seconds')
    .option('--execute-now', 'Execute immediately instead of scheduling')
    .action(async (opts) => {
      if (!EXECUTION_TYPES.includes(opts.type)) {
        return outputError(`Invalid execution type "${opts.type}". Valid types: ${EXECUTION_TYPES.join(', ')}`);
      }

      const groupIds = opts.groups === '__ALL__'
        ? ['__ALL__']
        : opts.groups.split(',').map((g: string) => g.trim());

      const body: Record<string, any> = {
        name: opts.name,
        execution_type: opts.type,
        scheduled_date: opts.date,
        group_ids: groupIds,
      };

      if (opts.message) body.message_content = opts.message;
      if (opts.media) body.media_url = opts.media;
      if (opts.mediaName) body.media_filename = opts.mediaName;
      if (opts.mediaMime) body.media_mimetype = opts.mediaMime;
      if (opts.mentionAll) body.mention_all = true;
      if (opts.pollQuestion) body.poll_question = opts.pollQuestion;
      if (opts.pollOptions) body.poll_options = opts.pollOptions.split(',').map((o: string) => o.trim());
      if (opts.additionalMessage) body.additional_message = opts.additionalMessage;
      if (opts.messageOrder) body.message_order = opts.messageOrder;
      if (opts.delay) body.delay_between_groups = Number(opts.delay);
      if (opts.executeNow) body.execute_now = true;

      const res = await client.post(`/v1/campaigns/${opts.campaign}/schedules`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Schedule "${opts.name}" created`, res.data);
    });

  cmd
    .command('update <scheduleId>')
    .description('Update a schedule')
    .requiredOption('-c, --campaign <id>', 'Campaign ID')
    .option('-n, --name <name>', 'New name')
    .option('-d, --date <datetime>', 'New datetime (ISO 8601)')
    .option('-m, --message <text>', 'New message content')
    .option('--media <url>', 'New media URL')
    .option('--media-name <filename>', 'New media filename')
    .option('--media-mime <mimetype>', 'New media MIME type')
    .option('--mention-all', 'Mention all group members')
    .option('--no-mention-all', 'Disable mention all')
    .option('--poll-question <question>', 'New poll question')
    .option('--poll-options <options>', 'Comma-separated poll options')
    .option('--additional-message <text>', 'Additional message')
    .option('--message-order <order>', 'Message order: media_first or message_first')
    .action(async (scheduleId, opts) => {
      const body: Record<string, any> = {};
      if (opts.name) body.name = opts.name;
      if (opts.date) body.scheduled_date = opts.date;
      if (opts.message) body.message_content = opts.message;
      if (opts.media) body.media_url = opts.media;
      if (opts.mediaName) body.media_filename = opts.mediaName;
      if (opts.mediaMime) body.media_mimetype = opts.mediaMime;
      if (opts.mentionAll === true) body.mention_all = true;
      if (opts.mentionAll === false) body.mention_all = false;
      if (opts.pollQuestion) body.poll_question = opts.pollQuestion;
      if (opts.pollOptions) body.poll_options = opts.pollOptions.split(',').map((o: string) => o.trim());
      if (opts.additionalMessage) body.additional_message = opts.additionalMessage;
      if (opts.messageOrder) body.message_order = opts.messageOrder;

      const res = await client.patch(`/v1/campaigns/${opts.campaign}/schedules/${scheduleId}`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule updated', res.data);
    });

  cmd
    .command('delete <scheduleId>')
    .description('Delete a schedule')
    .requiredOption('-c, --campaign <id>', 'Campaign ID')
    .action(async (scheduleId, opts) => {
      const res = await client.del(`/v1/campaigns/${opts.campaign}/schedules/${scheduleId}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule deleted');
    });

  cmd
    .command('retry <scheduleId>')
    .description('Retry a failed schedule')
    .requiredOption('-c, --campaign <id>', 'Campaign ID')
    .action(async (scheduleId, opts) => {
      const res = await client.post(`/v1/campaigns/${opts.campaign}/schedules/${scheduleId}/retry`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule retry queued', res.data);
    });

  cmd
    .command('pause <campaignId> <scheduleId>')
    .description('Pause a schedule')
    .action(async (campaignId, scheduleId) => {
      const res = await client.post(`/v1/campaigns/${campaignId}/schedules/${scheduleId}/pause`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule paused', res.data);
    });

  cmd
    .command('resume <campaignId> <scheduleId>')
    .description('Resume a schedule')
    .action(async (campaignId, scheduleId) => {
      const res = await client.post(`/v1/campaigns/${campaignId}/schedules/${scheduleId}/resume`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule resumed', res.data);
    });

  cmd
    .command('cancel <campaignId> <scheduleId>')
    .description('Cancel a schedule')
    .action(async (campaignId, scheduleId) => {
      const res = await client.post(`/v1/campaigns/${campaignId}/schedules/${scheduleId}/cancel`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule cancelled', res.data);
    });

  cmd
    .command('execute-now <campaignId> <scheduleId>')
    .description('Execute a schedule immediately')
    .action(async (campaignId, scheduleId) => {
      const res = await client.post(`/v1/campaigns/${campaignId}/schedules/${scheduleId}/execute-now`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Schedule execution started', res.data);
    });

  cmd
    .command('import')
    .description('Bulk-create schedules from a CSV or JSON file (one row/item per schedule)')
    .requiredOption('-c, --campaign <id>', 'Campaign ID')
    .requiredOption('-f, --file <path>', 'Path to .csv or .json file')
    .action(async (opts) => {
      let schedules: Record<string, any>[];
      try {
        const text = readFileSync(opts.file, 'utf-8');
        if (opts.file.toLowerCase().endsWith('.json')) {
          const parsed = JSON.parse(text);
          schedules = Array.isArray(parsed) ? parsed : parsed.schedules;
        } else {
          schedules = parseSchedulesCsv(text);
        }
      } catch (e: any) {
        return outputError(`Failed to read/parse file: ${e.message}`);
      }
      if (!Array.isArray(schedules) || schedules.length === 0) {
        return outputError('No schedules found in file');
      }
      const res = await client.post(`/v1/campaigns/${opts.campaign}/schedules/import`, { schedules });
      if (!res.success) return outputError(res.error!);
      outputSuccess(`Imported ${schedules.length} schedule(s)`, res.data);
    });
}
