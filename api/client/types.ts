// Auto-generated from api-contract.json - do not hand-edit
/* eslint-disable */

export type Json = Record<string, unknown>;
export interface ApiClientOptions {
  baseUrl: string;
  token?: string;
  onUnauthorized?: () => void;
}
export interface ApiError {
  status: number;
  message: string;
  body: unknown;
}

// --- agents namespace ---
export interface GetAgentsRequest {
}
export type GetAgentsResponse = { agents: unknown[] };

export interface GetAgentsByNameRequest {
  name: string;
}
export type GetAgentsByNameResponse = unknown;

export interface GetAgentsByNameTenvsRequest {
  name: string;
  thread_id?: string | undefined;
}
export type GetAgentsByNameTenvsResponse = unknown;

// --- api_keys namespace ---
export interface GetApiKeysRequest {
}
export type GetApiKeysResponse = unknown;

export interface PostApiKeysRequest {
  name?: string | undefined;
}
export type PostApiKeysResponse = unknown;

export interface DeleteApiKeysByIdRequest {
  id: string;
}
export type DeleteApiKeysByIdResponse = unknown;

// --- auth namespace ---
export interface PostAuthBootstrapRequest {
}
export type PostAuthBootstrapResponse = unknown;

export interface GetAuthConfigRequest {
}
export type GetAuthConfigResponse = unknown;

export interface GetAuthDeviceByCodeRequest {
  code: string;
}
export type GetAuthDeviceByCodeResponse = unknown;

export interface GetAuthDeviceByCodeApproveRequest {
  code: string;
  handoff?: string | undefined;
}
export type GetAuthDeviceByCodeApproveResponse = unknown;

export interface PostAuthDeviceStartRequest {
}
export type PostAuthDeviceStartResponse = unknown;

export interface PostAuthLoginRequest {
  username?: string | undefined;
  password?: string | undefined;
}
export type PostAuthLoginResponse = { token: string; user: { id: string; username: string; role: string } };

export interface GetAuthLogoutRequest {
  return_to?: string | undefined;
}
export type GetAuthLogoutResponse = unknown;

export interface PostAuthLogoutRequest {
}
export type PostAuthLogoutResponse = unknown;

export interface GetAuthMeRequest {
}
export type GetAuthMeResponse = unknown;

export interface PostAuthPlatformCleanupRequest {
  kind?: string | undefined;
  project_id?: string | undefined;
  exp?: string | undefined;
  key?: string | undefined;
  id?: string | undefined;
  params?: unknown | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}
export type PostAuthPlatformCleanupResponse = unknown;

export interface PostAuthPlatformReplicaRequest {
  kind?: string | undefined;
  project_id?: string | undefined;
  exp?: string | undefined;
  users?: unknown | undefined;
  platform_user_id?: string | undefined;
  username?: string | undefined;
  display_name?: string | undefined;
  email?: string | undefined;
  avatar_url?: string | undefined;
  role?: string | undefined;
  permissions?: unknown | undefined;
  session_revoked_at?: unknown | undefined;
}
export type PostAuthPlatformReplicaResponse = unknown;

export interface GetAuthSaCallbackRequest {
  handoff?: string | undefined;
  token?: string | undefined;
  return_to?: string | undefined;
}
export type GetAuthSaCallbackResponse = unknown;

export interface GetAuthSaStartRequest {
  return_to?: string | undefined;
}
export type GetAuthSaStartResponse = unknown;

// --- config namespace ---
export interface GetConfigRequest {
}
export type GetConfigResponse = unknown;

export interface GetEnvsInstanceRequest {
}
export type GetEnvsInstanceResponse = unknown;

export interface PatchEnvsInstanceRequest {
}
export type PatchEnvsInstanceResponse = unknown;

// --- diagnostics namespace ---
export interface GetDiagnosticsRequest {
}
export type GetDiagnosticsResponse = unknown;

export interface GetNewTestRequest {
}
export type GetNewTestResponse = unknown;

// --- hooks namespace ---
export interface GetHooksRequest {
}
export type GetHooksResponse = unknown;

// --- marketplace namespace ---
export interface GetPlatformEndpointRequest {
}
export type GetPlatformEndpointResponse = unknown;

export interface DeletePlatformSessionWildcardRequest {
  rest?: string;
}
export type DeletePlatformSessionWildcardResponse = unknown;

export interface GetPlatformSessionWildcardRequest {
  rest?: string;
}
export type GetPlatformSessionWildcardResponse = unknown;

export interface PatchPlatformSessionWildcardRequest {
  rest?: string;
}
export type PatchPlatformSessionWildcardResponse = unknown;

export interface PostPlatformSessionWildcardRequest {
  rest?: string;
}
export type PostPlatformSessionWildcardResponse = unknown;

export interface PutPlatformSessionWildcardRequest {
  rest?: string;
}
export type PutPlatformSessionWildcardResponse = unknown;

export interface DeletePlatformWildcardRequest {
  rest?: string;
}
export type DeletePlatformWildcardResponse = unknown;

export interface GetPlatformWildcardRequest {
  rest?: string;
}
export type GetPlatformWildcardResponse = unknown;

export interface PatchPlatformWildcardRequest {
  rest?: string;
}
export type PatchPlatformWildcardResponse = unknown;

export interface PostPlatformWildcardRequest {
  rest?: string;
}
export type PostPlatformWildcardResponse = unknown;

export interface PutPlatformWildcardRequest {
  rest?: string;
}
export type PutPlatformWildcardResponse = unknown;

// --- models namespace ---
export interface GetModelsRequest {
}
export type GetModelsResponse = { models: unknown[] };

export interface GetModelsByNameRequest {
  name: string;
}
export type GetModelsByNameResponse = unknown;

export interface GetModelsByNameCurlDataRequest {
  name: string;
}
export type GetModelsByNameCurlDataResponse = unknown;

export interface PostModelsAvailableRequest {
  search?: string | undefined;
  page?: number | undefined;
  perPage?: number | undefined;
  models?: string | undefined;
  hasNextPage?: number | undefined;
  provider?: string | undefined;
  filter?: unknown | undefined;
}
export type PostModelsAvailableResponse = { models: unknown[]; hasNextPage: boolean };

export interface PostModelsCapabilitiesRequest {
  provider?: string | undefined;
  modelId?: string | undefined;
}
export type PostModelsCapabilitiesResponse = unknown;

export interface PostModelsEndpointsRequest {
  provider?: string | undefined;
  modelSlug?: string | undefined;
}
export type PostModelsEndpointsResponse = unknown;

// --- pack namespace ---
export interface PostPackByAgentnameRequest {
  agentName: string;
}
export type PostPackByAgentnameResponse = unknown;

export interface GetPackByAgentnameAnalyzeRequest {
  agentName: string;
}
export type GetPackByAgentnameAnalyzeResponse = unknown;

export interface GetPackByAgentnameMetadataRequest {
  agentName: string;
}
export type GetPackByAgentnameMetadataResponse = unknown;

export interface GetPackByAgentnamePackedInfoRequest {
  agentName: string;
}
export type GetPackByAgentnamePackedInfoResponse = unknown;

export interface PostPackByAgentnamePublishRequest {
  agentName: string;
}
export type PostPackByAgentnamePublishResponse = unknown;

export interface GetPackNpmTokenStatusRequest {
}
export type GetPackNpmTokenStatusResponse = unknown;

// --- platformAuth namespace ---
export interface PostPlatformAuthBootstrapRequest {
}
export type PostPlatformAuthBootstrapResponse = unknown;

export interface PostPlatformAuthLoginRequest {
}
export type PostPlatformAuthLoginResponse = unknown;

export interface PostPlatformAuthLogoutRequest {
}
export type PostPlatformAuthLogoutResponse = unknown;

export interface GetPlatformAuthMeRequest {
}
export type GetPlatformAuthMeResponse = unknown;

// --- prompts namespace ---
export interface GetPromptsRequest {
}
export type GetPromptsResponse = unknown;

export interface GetPromptsByNameRequest {
  name: string;
}
export type GetPromptsByNameResponse = unknown;

export interface GetPromptsByNameTenvsRequest {
  name: string;
  thread_id?: string | undefined;
}
export type GetPromptsByNameTenvsResponse = unknown;

// --- providers namespace ---
export interface GetProvidersRequest {
}
export type GetProvidersResponse = unknown;

export interface GetProvidersByNameIconRequest {
  name: string;
  model?: string | undefined;
}
export type GetProvidersByNameIconResponse = unknown;

export interface GetProvidersByNameToolsRequest {
  name: string;
  model?: string | undefined;
}
export type GetProvidersByNameToolsResponse = unknown;

// --- root namespace ---
export interface PostRequest {
}
export type PostResponse = unknown;

// --- skills namespace ---
export interface GetSkillsRequest {
  all?: boolean | undefined;
}
export type GetSkillsResponse = unknown;

export interface PostSkillsRequest {
}
export type PostSkillsResponse = unknown;

export interface DeleteSkillsByNameRequest {
  name: string;
}
export type DeleteSkillsByNameResponse = unknown;

export interface GetSkillsByNameRequest {
  name: string;
}
export type GetSkillsByNameResponse = unknown;

export interface PatchSkillsByNameRequest {
  name: string;
}
export type PatchSkillsByNameResponse = unknown;

export interface GetSkillsByNameFilesWildcardRequest {
  name: string;
  rest?: string;
}
export type GetSkillsByNameFilesWildcardResponse = unknown;

// --- streaming namespace ---
export interface GetEventsRequest {
}
export type GetEventsResponse = unknown;

// --- threads namespace ---
export interface GetThreadsRequest {
  limit?: number | undefined;
  offset?: number | undefined;
  agent_id?: string | undefined;
  include_children?: boolean | undefined;
  search?: string | undefined;
  startDate?: unknown | undefined;
  endDate?: unknown | undefined;
}
export type GetThreadsResponse = { threads: unknown[]; total: number; hasMore: boolean };

export interface PostThreadsRequest {
  agent_id?: string | undefined;
  initial_messages?: string | undefined;
  data?: unknown | undefined;
  tags?: unknown | undefined;
  env?: unknown | undefined;
  env_types?: string | undefined;
  tenvs?: unknown | undefined;
  properties?: unknown | undefined;
}
export type PostThreadsResponse = { threadId: string; agent_id: string; message: string };

export interface DeleteThreadsByIdRequest {
  id: string;
}
export type DeleteThreadsByIdResponse = unknown;

export interface GetThreadsByIdRequest {
  id: string;
}
export type GetThreadsByIdResponse = { thread: unknown; agent: unknown; stats: unknown };

export interface PatchThreadsByIdRequest {
  id: string;
  tags?: unknown | undefined;
  agent_id?: string | undefined;
  env?: unknown | undefined;
  env_types?: string | undefined;
  env_patch?: unknown | undefined;
  env_type_patch?: string | undefined;
  env_delete?: unknown | undefined;
  tenvs?: unknown | undefined;
}
export type PatchThreadsByIdResponse = unknown;

export interface GetThreadsByIdBridgeRequest {
  id: string;
}
export type GetThreadsByIdBridgeResponse = unknown;

export interface PostThreadsByIdContinueRequest {
  id: string;
}
export type PostThreadsByIdContinueResponse = unknown;

export interface GetThreadsByIdCostRequest {
  id: string;
}
export type GetThreadsByIdCostResponse = unknown;

export interface GetThreadsByIdDiagnosticsRequest {
  id: string;
}
export type GetThreadsByIdDiagnosticsResponse = unknown;

export interface GetThreadsByIdEffectsRequest {
  id: string;
  limit?: number | undefined;
  offset?: number | undefined;
}
export type GetThreadsByIdEffectsResponse = unknown;

export interface PostThreadsByIdEffectsByEffectidCancelRequest {
  id: string;
  effectId: string;
}
export type PostThreadsByIdEffectsByEffectidCancelResponse = unknown;

export interface PostThreadsByIdEffectsByEffectidRunRequest {
  id: string;
  effectId: string;
}
export type PostThreadsByIdEffectsByEffectidRunResponse = unknown;

export interface GetThreadsByIdFsRequest {
  id: string;
  grep?: unknown | undefined;
  path?: string | undefined;
  limit?: number | undefined;
  find?: unknown | undefined;
  type?: string | undefined;
}
export type GetThreadsByIdFsResponse = unknown;

export interface DeleteThreadsByIdFsWildcardRequest {
  id: string;
  rest?: string;
  format?: string | undefined;
}
export type DeleteThreadsByIdFsWildcardResponse = unknown;

export interface GetThreadsByIdFsWildcardRequest {
  id: string;
  rest?: string;
  format?: string | undefined;
}
export type GetThreadsByIdFsWildcardResponse = unknown;

export interface PostThreadsByIdFsWildcardRequest {
  id: string;
  rest?: string;
  format?: string | undefined;
}
export type PostThreadsByIdFsWildcardResponse = unknown;

export interface DeleteThreadsByIdKvRequest {
  id: string;
  key?: string | undefined;
  search?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}
export type DeleteThreadsByIdKvResponse = unknown;

export interface GetThreadsByIdKvRequest {
  id: string;
  key?: string | undefined;
  search?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}
export type GetThreadsByIdKvResponse = unknown;

export interface PostThreadsByIdKvRequest {
  id: string;
  key?: string | undefined;
  search?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
}
export type PostThreadsByIdKvResponse = unknown;

export interface GetThreadsByIdLogsRequest {
  id: string;
  limit?: number | undefined;
  offset?: number | undefined;
  order?: string | undefined;
  ids?: string | undefined;
  messageIds?: string | undefined;
  includeWorkblocks?: boolean | undefined;
  includeDescendants?: boolean | undefined;
}
export type GetThreadsByIdLogsResponse = unknown;

export interface GetThreadsByIdLogsByLogidRequest {
  id: string;
  logId: string;
}
export type GetThreadsByIdLogsByLogidResponse = unknown;

export interface GetThreadsByIdLogsByLogidInspectByProviderRequest {
  id: string;
  logId: string;
  provider: string;
}
export type GetThreadsByIdLogsByLogidInspectByProviderResponse = unknown;

export interface GetThreadsByIdMessagesRequest {
  id: string;
  limit?: number | undefined;
  offset?: number | undefined;
  order?: string | undefined;
  includeSilent?: boolean | undefined;
  depth?: number | undefined;
  ids?: string | undefined;
  includeWorkblocks?: boolean | undefined;
}
export type GetThreadsByIdMessagesResponse = unknown;

export interface PostThreadsByIdMessagesRequest {
  id: string;
  name?: string | undefined;
  mimeType?: string | undefined;
  data?: unknown | undefined;
  width?: string | undefined;
  height?: number | undefined;
  thumbnail?: string | undefined;
  content?: string | undefined;
  role?: string | undefined;
  attachments?: unknown | undefined;
  silent?: boolean | undefined;
}
export type PostThreadsByIdMessagesResponse = unknown;

export interface DeleteThreadsByIdMessagesByMessageidRequest {
  id: string;
  messageId: string;
}
export type DeleteThreadsByIdMessagesByMessageidResponse = unknown;

export interface PatchThreadsByIdMessagesByMessageidRequest {
  id: string;
  messageId: string;
}
export type PatchThreadsByIdMessagesByMessageidResponse = unknown;

export interface GetThreadsByIdPendingToolCallsRequest {
  id: string;
}
export type GetThreadsByIdPendingToolCallsResponse = unknown;

export interface PostThreadsByIdReviveRequest {
  id: string;
}
export type PostThreadsByIdReviveResponse = unknown;

export interface PostThreadsByIdRpcRequest {
  id: string;
  method?: unknown | undefined;
  args?: unknown | undefined;
}
export type PostThreadsByIdRpcResponse = unknown;

export interface PostThreadsByIdStopRequest {
  id: string;
}
export type PostThreadsByIdStopResponse = unknown;

export interface GetThreadsByIdStreamRequest {
  id: string;
}
export type GetThreadsByIdStreamResponse = unknown;

export interface GetThreadsByIdSubagentsRequest {
  id: string;
}
export type GetThreadsByIdSubagentsResponse = unknown;

export interface PostThreadsByIdToolResultRequest {
  id: string;
}
export type PostThreadsByIdToolResultResponse = unknown;

export interface GetThreadsByIdVariablesByRequestidRequest {
  id: string;
  requestId: string;
}
export type GetThreadsByIdVariablesByRequestidResponse = unknown;

export interface PostThreadsByIdVariablesByRequestidRequest {
  id: string;
  requestId: string;
}
export type PostThreadsByIdVariablesByRequestidResponse = unknown;

// --- tools namespace ---
export interface GetToolsRequest {
  type?: string | undefined;
  schema?: unknown | undefined;
}
export type GetToolsResponse = unknown;

export interface GetToolsByNameRequest {
  name: string;
}
export type GetToolsByNameResponse = unknown;

// --- unpack namespace ---
export interface PostUnpackByPackageidRequest {
  packageId: string;
}
export type PostUnpackByPackageidResponse = unknown;

export interface GetUnpackByPackageidAnalyzeRequest {
  packageId: string;
}
export type GetUnpackByPackageidAnalyzeResponse = unknown;

// --- users namespace ---
export interface GetUsersRequest {
}
export type GetUsersResponse = unknown;

export interface PostUsersRequest {
  username?: string | undefined;
  password?: string | undefined;
  role?: string | undefined;
}
export type PostUsersResponse = unknown;

export interface DeleteUsersByIdRequest {
  id: string;
}
export type DeleteUsersByIdResponse = unknown;

export interface PutUsersByIdRequest {
  id: string;
  username?: string | undefined;
  password?: string | undefined;
  role?: string | undefined;
  permissions?: unknown | undefined;
}
export type PutUsersByIdResponse = unknown;

export interface DeleteUsersByIdWildcardRequest {
  id: string;
  rest?: string;
}
export type DeleteUsersByIdWildcardResponse = unknown;

export interface GetUsersByIdWildcardRequest {
  id: string;
  rest?: string;
}
export type GetUsersByIdWildcardResponse = unknown;

export interface PatchUsersByIdWildcardRequest {
  id: string;
  rest?: string;
}
export type PatchUsersByIdWildcardResponse = unknown;

export interface PostUsersByIdWildcardRequest {
  id: string;
  rest?: string;
}
export type PostUsersByIdWildcardResponse = unknown;

export interface PutUsersByIdWildcardRequest {
  id: string;
  rest?: string;
}
export type PutUsersByIdWildcardResponse = unknown;

export interface GetUsersByIdEnvRequest {
  id: string;
}
export type GetUsersByIdEnvResponse = unknown;

export interface PatchUsersByIdEnvRequest {
  id: string;
}
export type PatchUsersByIdEnvResponse = unknown;

export interface GetUsersByIdStreamRequest {
  id: string;
}
export type GetUsersByIdStreamResponse = unknown;

export interface DeleteUsersMeWildcardRequest {
  rest?: string;
}
export type DeleteUsersMeWildcardResponse = unknown;

export interface GetUsersMeWildcardRequest {
  rest?: string;
}
export type GetUsersMeWildcardResponse = unknown;

export interface PatchUsersMeWildcardRequest {
  rest?: string;
}
export type PatchUsersMeWildcardResponse = unknown;

export interface PostUsersMeWildcardRequest {
  rest?: string;
}
export type PostUsersMeWildcardResponse = unknown;

export interface PutUsersMeWildcardRequest {
  rest?: string;
}
export type PutUsersMeWildcardResponse = unknown;

export interface GetUsersMeEnvRequest {
}
export type GetUsersMeEnvResponse = unknown;

export interface PatchUsersMeEnvRequest {
}
export type PatchUsersMeEnvResponse = unknown;

export interface GetUsersMeHubRequest {
}
export type GetUsersMeHubResponse = unknown;

export interface DeleteUsersMeKvRequest {
  key?: string | undefined;
}
export type DeleteUsersMeKvResponse = unknown;

export interface GetUsersMeKvRequest {
  key?: string | undefined;
  limit?: number | undefined;
  offset?: number | undefined;
  prefix?: string | undefined;
}
export type GetUsersMeKvResponse = unknown;

export interface PostUsersMeKvRequest {
}
export type PostUsersMeKvResponse = unknown;

export interface GetUsersMeStreamRequest {
}
export type GetUsersMeStreamResponse = unknown;

// --- variables namespace ---
export interface GetVariablesAgentsByNameRequest {
  name: string;
  thread_id?: string | undefined;
}
export type GetVariablesAgentsByNameResponse = unknown;

export interface GetVariablesPromptsByNameRequest {
  name: string;
  thread_id?: string | undefined;
}
export type GetVariablesPromptsByNameResponse = unknown;

export interface GetVariablesToolsByNameRequest {
  name: string;
  thread_id?: string | undefined;
}
export type GetVariablesToolsByNameResponse = unknown;
