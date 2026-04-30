import { z } from 'zod';
import type { ZenHubClient } from '@zenhub/client';

export interface ToolDefinition<TInput extends z.ZodRawShape = z.ZodRawShape> {
  name: string;
  category: string;
  description: string;
  schema: TInput;
  handler: (client: ZenHubClient, args: z.infer<z.ZodObject<TInput>>) => Promise<unknown>;
}

export type AnyTool = ToolDefinition<any>;

export function defineTool<TInput extends z.ZodRawShape>(
  def: ToolDefinition<TInput>,
): ToolDefinition<TInput> {
  return def;
}
