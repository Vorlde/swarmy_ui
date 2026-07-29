// Auto-generated Zod schemas for critical endpoints
/* eslint-disable */
import { z } from 'zod';

export const LoginRequestSchema = z.object({
  username: z.string().optional(),
  password: z.string(),
});

export const LoginResponseSchema = z.object({
  token: z.string(),
  user: z.object({
    id: z.string(),
    username: z.string(),
    role: z.string(),
  }),
});

export const ThreadCreateRequestSchema = z.object({
  agent_id: z.string(),
  initial_messages: z.array(z.record(z.any())).optional(),
  data: z.record(z.any()).optional(),
  tags: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
  env_types: z.record(z.enum(['text', 'secret'])).optional(),
  tenvs: z.record(z.any()).optional(),
  properties: z.record(z.any()).optional(),
});

export const ThreadCreateResponseSchema = z.object({
  threadId: z.string(),
  agent_id: z.string(),
  message: z.string(),
});

export const ThreadListRequestSchema = z.object({
  limit: z.number().optional(),
  offset: z.number().optional(),
  agent_id: z.string().optional(),
  include_children: z.string().optional(),
  search: z.string().optional(),
  startDate: z.number().optional(),
  endDate: z.number().optional(),
});

export const ThreadListResponseSchema = z.object({
  threads: z.array(z.record(z.any())),
  total: z.number(),
  hasMore: z.boolean(),
});

export const ThreadGetResponseSchema = z.object({
  thread: z.record(z.any()),
  agent: z.record(z.any()),
  stats: z.record(z.any()),
});

export const MessageCreateRequestSchema = z.object({
  threadId: z.string(),
  content: z.string().optional(),
  role: z.enum(['user', 'assistant', 'system']).optional(),
  attachments: z.array(z.record(z.any())).optional(),
  silent: z.boolean().optional(),
});

export const AgentListResponseSchema = z.object({
  agents: z.array(z.record(z.any())),
});

export const ModelListResponseSchema = z.object({
  models: z.array(z.record(z.any())),
});

export const ModelAvailableRequestSchema = z.object({
  provider: z.string(),
  search: z.string().optional(),
  page: z.number().optional(),
  perPage: z.number().optional(),
  filter: z.string().optional(),
});

export const ModelAvailableResponseSchema = z.object({
  models: z.array(z.any()),
  hasNextPage: z.boolean(),
});

export const PackRequestSchema = z.object({
  agentName: z.string(),
  itemSelections: z.array(z.record(z.any())).optional(),
  version: z.string().optional(),
  packageId: z.string().optional(),
  packageName: z.string().optional(),
  license: z.string().optional(),
  licenseOwner: z.string().optional(),
  readme: z.string().optional(),
});

export const PackResponseSchema = z.record(z.any());

export const schemas = {
  loginRequest: LoginRequestSchema,
  loginResponse: LoginResponseSchema,
  threadCreateRequest: ThreadCreateRequestSchema,
  threadCreateResponse: ThreadCreateResponseSchema,
  threadListRequest: ThreadListRequestSchema,
  threadListResponse: ThreadListResponseSchema,
  threadGetResponse: ThreadGetResponseSchema,
  messageCreateRequest: MessageCreateRequestSchema,
  agentListResponse: AgentListResponseSchema,
  modelListResponse: ModelListResponseSchema,
  modelAvailableRequest: ModelAvailableRequestSchema,
  modelAvailableResponse: ModelAvailableResponseSchema,
  packRequest: PackRequestSchema,
  packResponse: PackResponseSchema,
};
