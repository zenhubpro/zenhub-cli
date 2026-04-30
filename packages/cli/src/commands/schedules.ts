import { Command } from 'commander';
import { ZenHubClient } from '@zenhub/client';
import { output, outputError, outputSuccess } from '../lib/output';

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
}
