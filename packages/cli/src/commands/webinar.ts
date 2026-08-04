import { Command } from 'commander';
import { ZenHubClient } from '@zenhubpro/client';
import { output, outputError, outputSuccess } from '../lib/output';

function base(campaignId: string) {
  return `/v1/campaigns/${campaignId}/webinar`;
}

export function registerWebinar(program: Command, client: ZenHubClient) {
  const cmd = program.command('webinar').description('Webinar campaign cadence, templates, and cycles');

  // --- config ---
  const config = cmd.command('config').description('Webinar cadence configuration');

  config
    .command('get <campaignId>')
    .description('Get webinar config')
    .action(async (campaignId) => {
      const res = await client.get(`${base(campaignId)}/config`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  config
    .command('set <campaignId>')
    .description('Update webinar config (cadence, base group settings)')
    .option('--recurrence-mode <mode>', 'specific or recurring')
    .option('--interval-kind <kind>', 'Interval unit (e.g. week, month)')
    .option('--interval-n <number>', 'Interval count')
    .option('--rotation-time <HH:mm>', 'Time of day cycles rotate')
    .option('--timezone <tz>', 'IANA timezone')
    .option('--groups-per-cycle <number>', 'Number of groups created per cycle')
    .option('--group-name-pattern <pattern>', 'Group name template')
    .option('--event-weekdays <days>', 'Comma-separated weekdays (0=Sun..6=Sat)')
    .option('--event-day-of-month <number>', 'Day of month (1-31) for monthly recurrence')
    .option('--capture-close-offset-seconds <number>', 'Seconds after event start to close capture')
    .option('--capture-close-by-weekday <json>', 'JSON map of weekday -> offset seconds')
    .option('--active', 'Activate webinar config')
    .option('--no-active', 'Deactivate webinar config')
    .option('--base-group-name <name>', 'Base group name template')
    .option('--base-group-description <text>', 'Base group description')
    .option('--base-group-picture-url <url>', 'Base group picture URL')
    .option('--base-member-limit <number>', 'Base member limit per group')
    .option('--base-lock-group', 'Lock new groups (only admins post)')
    .option('--no-base-lock-group', 'Do not lock new groups')
    .option('--base-lock-settings', 'Lock group settings edit to admins')
    .option('--no-base-lock-settings', 'Do not lock group settings')
    .option('--base-start-number <number>', 'Starting number for group name numbering')
    .option('--base-hashtag-position <position>', 'Hashtag position in group name')
    .option('--base-additional-admins <phones>', 'Comma-separated additional admin phone numbers')
    .action(async (campaignId, opts) => {
      const body: Record<string, any> = {};
      if (opts.recurrenceMode) body.recurrence_mode = opts.recurrenceMode;
      if (opts.intervalKind) body.interval_kind = opts.intervalKind;
      if (opts.intervalN) body.interval_n = Number(opts.intervalN);
      if (opts.rotationTime) body.rotation_time = opts.rotationTime;
      if (opts.timezone) body.timezone = opts.timezone;
      if (opts.groupsPerCycle) body.groups_per_cycle = Number(opts.groupsPerCycle);
      if (opts.groupNamePattern) body.group_name_pattern = opts.groupNamePattern;
      if (opts.eventWeekdays) body.event_weekdays = opts.eventWeekdays.split(',').map((d: string) => Number(d.trim()));
      if (opts.eventDayOfMonth) body.event_day_of_month = Number(opts.eventDayOfMonth);
      if (opts.captureCloseOffsetSeconds) body.capture_close_offset_seconds = Number(opts.captureCloseOffsetSeconds);
      if (opts.captureCloseByWeekday) body.capture_close_by_weekday = JSON.parse(opts.captureCloseByWeekday);
      if (opts.active !== undefined) body.is_active = opts.active;
      if (opts.baseGroupName) body.base_group_name = opts.baseGroupName;
      if (opts.baseGroupDescription) body.base_group_description = opts.baseGroupDescription;
      if (opts.baseGroupPictureUrl) body.base_group_picture_url = opts.baseGroupPictureUrl;
      if (opts.baseMemberLimit) body.base_member_limit = Number(opts.baseMemberLimit);
      if (opts.baseLockGroup !== undefined) body.base_lock_group = opts.baseLockGroup;
      if (opts.baseLockSettings !== undefined) body.base_lock_settings = opts.baseLockSettings;
      if (opts.baseStartNumber) body.base_start_number = Number(opts.baseStartNumber);
      if (opts.baseHashtagPosition) body.base_hashtag_position = opts.baseHashtagPosition;
      if (opts.baseAdditionalAdmins) {
        body.base_additional_admins = opts.baseAdditionalAdmins
          .split(',')
          .map((a: string) => ({ phone_number: a.trim() }));
      }

      const res = await client.put(`${base(campaignId)}/config`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Webinar config updated', res.data);
    });

  // --- templates ---
  const templates = cmd.command('templates').description('Webinar message templates');

  templates
    .command('list <campaignId>')
    .description('List webinar templates')
    .action(async (campaignId) => {
      const res = await client.get(`${base(campaignId)}/templates`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  function templateBody(opts: any) {
    const body: Record<string, any> = {};
    if (opts.type) body.execution_type = opts.type;
    if (opts.message) body.message_content = opts.message;
    if (opts.mediaUrl) body.media_url = opts.mediaUrl;
    if (opts.mediaFilename) body.media_filename = opts.mediaFilename;
    if (opts.mediaMimetype) body.media_mimetype = opts.mediaMimetype;
    if (opts.newGroupName) body.new_group_name = opts.newGroupName;
    if (opts.newGroupDescription) body.new_group_description = opts.newGroupDescription;
    if (opts.pollQuestion) body.poll_question = opts.pollQuestion;
    if (opts.pollOptions) body.poll_options = opts.pollOptions.split(',').map((o: string) => o.trim());
    if (opts.blocks) body.blocks = JSON.parse(opts.blocks);
    if (opts.delayBetweenBlocks) body.delay_between_blocks = Number(opts.delayBetweenBlocks);
    if (opts.offsetDays !== undefined) body.offset_days = Number(opts.offsetDays);
    if (opts.executionTime) body.execution_time = opts.executionTime;
    if (opts.sortOrder) body.sort_order = Number(opts.sortOrder);
    if (opts.active !== undefined) body.is_active = opts.active;
    return body;
  }

  templates
    .command('create <campaignId>')
    .description('Create a webinar template')
    .requiredOption(
      '--type <type>',
      'text|image|audio|video|document|poll|change_name|change_description|change_photo|lock_group|unlock_group|promote_admin|demote_admin|multiple',
    )
    .requiredOption('--offset-days <number>', 'Days relative to event date (-365..365)')
    .requiredOption('--execution-time <HH:mm>', 'Time of day to execute')
    .option('--message <text>', 'Message content')
    .option('--media-url <url>', 'Media URL')
    .option('--media-filename <name>', 'Media filename')
    .option('--media-mimetype <mimetype>', 'Media MIME type')
    .option('--new-group-name <name>', 'New group name (for change_name)')
    .option('--new-group-description <text>', 'New group description (for change_description)')
    .option('--poll-question <text>', 'Poll question')
    .option('--poll-options <options>', 'Comma-separated poll options')
    .option('--blocks <json>', 'JSON array of blocks (for multiple type)')
    .option('--delay-between-blocks <ms>', 'Delay between blocks in ms')
    .option('--sort-order <number>', 'Sort order')
    .option('--active', 'Mark template active')
    .option('--no-active', 'Mark template inactive')
    .action(async (campaignId, opts) => {
      const res = await client.post(`${base(campaignId)}/templates`, templateBody(opts));
      if (!res.success) return outputError(res.error!);
      outputSuccess('Webinar template created', res.data);
    });

  templates
    .command('update <campaignId> <templateId>')
    .description('Update a webinar template')
    .option('--type <type>', 'Execution type')
    .option('--offset-days <number>', 'Days relative to event date (-365..365)')
    .option('--execution-time <HH:mm>', 'Time of day to execute')
    .option('--message <text>', 'Message content')
    .option('--media-url <url>', 'Media URL')
    .option('--media-filename <name>', 'Media filename')
    .option('--media-mimetype <mimetype>', 'Media MIME type')
    .option('--new-group-name <name>', 'New group name')
    .option('--new-group-description <text>', 'New group description')
    .option('--poll-question <text>', 'Poll question')
    .option('--poll-options <options>', 'Comma-separated poll options')
    .option('--blocks <json>', 'JSON array of blocks')
    .option('--delay-between-blocks <ms>', 'Delay between blocks in ms')
    .option('--sort-order <number>', 'Sort order')
    .option('--active', 'Mark template active')
    .option('--no-active', 'Mark template inactive')
    .action(async (campaignId, templateId, opts) => {
      const res = await client.put(`${base(campaignId)}/templates/${templateId}`, templateBody(opts));
      if (!res.success) return outputError(res.error!);
      outputSuccess('Webinar template updated', res.data);
    });

  templates
    .command('delete <campaignId> <templateId>')
    .description('Delete a webinar template')
    .action(async (campaignId, templateId) => {
      const res = await client.del(`${base(campaignId)}/templates/${templateId}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Webinar template deleted');
    });

  // --- cycles ---
  const cycles = cmd.command('cycles').description('Webinar cycles');

  cycles
    .command('list <campaignId>')
    .description('List webinar cycles')
    .action(async (campaignId) => {
      const res = await client.get(`${base(campaignId)}/cycles`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cycles
    .command('create <campaignId>')
    .description('Create a webinar cycle')
    .requiredOption('--event-date <date>', 'Event date (ISO 8601)')
    .option('--name <name>', 'Cycle name')
    .option('--link-group-id <id>', 'Group ID to link this cycle to')
    .option('--capture-close-at <date>', 'Capture close date/time (ISO 8601)')
    .option('--first-group <json>', 'JSON object describing the first group for this cycle')
    .action(async (campaignId, opts) => {
      const body: Record<string, any> = { event_date: opts.eventDate };
      if (opts.name) body.name = opts.name;
      if (opts.linkGroupId) body.link_group_id = opts.linkGroupId;
      if (opts.captureCloseAt) body.capture_close_at = opts.captureCloseAt;
      if (opts.firstGroup) body.first_group = JSON.parse(opts.firstGroup);

      const res = await client.post(`${base(campaignId)}/cycles`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Webinar cycle created', res.data);
    });

  cycles
    .command('update <campaignId> <cycleId>')
    .description('Update a webinar cycle')
    .option('--event-date <date>', 'Event date (ISO 8601)')
    .option('--name <name>', 'Cycle name')
    .option('--capture-close-at <date>', 'Capture close date/time (ISO 8601)')
    .action(async (campaignId, cycleId, opts) => {
      const body: Record<string, any> = {};
      if (opts.eventDate) body.event_date = opts.eventDate;
      if (opts.name) body.name = opts.name;
      if (opts.captureCloseAt) body.capture_close_at = opts.captureCloseAt;

      const res = await client.patch(`${base(campaignId)}/cycles/${cycleId}`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Webinar cycle updated', res.data);
    });

  cycles
    .command('delete <campaignId> <cycleId>')
    .description('Delete a webinar cycle')
    .action(async (campaignId, cycleId) => {
      const res = await client.del(`${base(campaignId)}/cycles/${cycleId}`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Webinar cycle deleted');
    });

  // --- cycle actions ---
  const cycle = cmd.command('cycle').description('Webinar cycle actions');

  cycle
    .command('close-capture <campaignId> <cycleId>')
    .description('Close capture window for a cycle')
    .option('--scheduled-at <date>', 'Schedule the close for a future date/time (ISO 8601)')
    .action(async (campaignId, cycleId, opts) => {
      const body: Record<string, any> = {};
      if (opts.scheduledAt) body.scheduled_at = opts.scheduledAt;
      const res = await client.patch(`${base(campaignId)}/cycles/${cycleId}/close-capture`, body);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Capture closed', res.data);
    });

  cycle
    .command('reopen-capture <campaignId> <cycleId>')
    .description('Reopen capture window for a cycle')
    .action(async (campaignId, cycleId) => {
      const res = await client.patch(`${base(campaignId)}/cycles/${cycleId}/reopen-capture`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Capture reopened', res.data);
    });

  cycle
    .command('skip <campaignId> <cycleId>')
    .description('Skip a cycle')
    .action(async (campaignId, cycleId) => {
      const res = await client.patch(`${base(campaignId)}/cycles/${cycleId}/skip`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Cycle skipped', res.data);
    });

  cycle
    .command('unskip <campaignId> <cycleId>')
    .description('Unskip a cycle')
    .action(async (campaignId, cycleId) => {
      const res = await client.patch(`${base(campaignId)}/cycles/${cycleId}/unskip`);
      if (!res.success) return outputError(res.error!);
      outputSuccess('Cycle unskipped', res.data);
    });

  cycle
    .command('assign-group <campaignId> <cycleId>')
    .description('Assign a group to a cycle')
    .requiredOption('--group <groupId>', 'Group ID')
    .action(async (campaignId, cycleId, opts) => {
      const res = await client.patch(`${base(campaignId)}/cycles/${cycleId}/assign-group`, {
        group_id: opts.group,
      });
      if (!res.success) return outputError(res.error!);
      outputSuccess('Group assigned', res.data);
    });

  cycle
    .command('unassign-group <campaignId> <cycleId>')
    .description('Unassign a group from a cycle')
    .requiredOption('--group <groupId>', 'Group ID')
    .action(async (campaignId, cycleId, opts) => {
      const res = await client.patch(`${base(campaignId)}/cycles/${cycleId}/unassign-group`, {
        group_id: opts.group,
      });
      if (!res.success) return outputError(res.error!);
      outputSuccess('Group unassigned', res.data);
    });

  // --- read-only helpers ---
  cmd
    .command('groups-status <campaignId>')
    .description('Get webinar groups status overview')
    .action(async (campaignId) => {
      const res = await client.get(`${base(campaignId)}/groups-status`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });

  cmd
    .command('linkable-groups <campaignId>')
    .description('List groups that can be linked to a webinar cycle')
    .action(async (campaignId) => {
      const res = await client.get(`${base(campaignId)}/linkable-groups`);
      if (!res.success) return outputError(res.error!);
      output(res.data);
    });
}
