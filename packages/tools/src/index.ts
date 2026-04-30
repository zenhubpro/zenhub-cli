import { campaignsTools } from './tools/campaigns';
import { groupsTools } from './tools/groups';
import { schedulesTools } from './tools/schedules';
import { messagesTools } from './tools/messages';
import { conversationsTools } from './tools/conversations';
import { contactsTools } from './tools/contacts';
import { connectionsTools } from './tools/connections';
import { statsTools } from './tools/stats';
import { accessListTools } from './tools/access-list';
import { blacklistTools } from './tools/blacklist';
import { buyersTools } from './tools/buyers';
import type { AnyTool } from './types';

export * from './types';

export const allTools: AnyTool[] = [
  ...campaignsTools,
  ...groupsTools,
  ...schedulesTools,
  ...messagesTools,
  ...conversationsTools,
  ...contactsTools,
  ...connectionsTools,
  ...statsTools,
  ...accessListTools,
  ...blacklistTools,
  ...buyersTools,
];

export function toolByName(name: string): AnyTool | undefined {
  return allTools.find((t) => t.name === name);
}

export function toolsByCategory(category: string): AnyTool[] {
  return allTools.filter((t) => t.category === category);
}
