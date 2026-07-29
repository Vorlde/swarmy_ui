// Auto-generated from api-contract.json - do not hand-edit
/* eslint-disable */

import type {
  ApiClientOptions,
  ApiError,
  Json,
  PostRequest,
  PostResponse,
  GetAgentsRequest,
  GetAgentsResponse,
  GetAgentsByNameRequest,
  GetAgentsByNameResponse,
  GetAgentsByNameTenvsRequest,
  GetAgentsByNameTenvsResponse,
  GetApiKeysRequest,
  GetApiKeysResponse,
  PostApiKeysRequest,
  PostApiKeysResponse,
  DeleteApiKeysByIdRequest,
  DeleteApiKeysByIdResponse,
  PostAuthBootstrapRequest,
  PostAuthBootstrapResponse,
  GetAuthConfigRequest,
  GetAuthConfigResponse,
  GetAuthDeviceByCodeRequest,
  GetAuthDeviceByCodeResponse,
  GetAuthDeviceByCodeApproveRequest,
  GetAuthDeviceByCodeApproveResponse,
  PostAuthDeviceStartRequest,
  PostAuthDeviceStartResponse,
  PostAuthLoginRequest,
  PostAuthLoginResponse,
  GetAuthLogoutRequest,
  GetAuthLogoutResponse,
  PostAuthLogoutRequest,
  PostAuthLogoutResponse,
  GetAuthMeRequest,
  GetAuthMeResponse,
  PostAuthPlatformCleanupRequest,
  PostAuthPlatformCleanupResponse,
  PostAuthPlatformReplicaRequest,
  PostAuthPlatformReplicaResponse,
  GetAuthSaCallbackRequest,
  GetAuthSaCallbackResponse,
  GetAuthSaStartRequest,
  GetAuthSaStartResponse,
  GetConfigRequest,
  GetConfigResponse,
  GetDiagnosticsRequest,
  GetDiagnosticsResponse,
  GetEnvsInstanceRequest,
  GetEnvsInstanceResponse,
  PatchEnvsInstanceRequest,
  PatchEnvsInstanceResponse,
  GetEventsRequest,
  GetEventsResponse,
  GetHooksRequest,
  GetHooksResponse,
  GetModelsRequest,
  GetModelsResponse,
  GetModelsByNameRequest,
  GetModelsByNameResponse,
  GetModelsByNameCurlDataRequest,
  GetModelsByNameCurlDataResponse,
  PostModelsAvailableRequest,
  PostModelsAvailableResponse,
  PostModelsCapabilitiesRequest,
  PostModelsCapabilitiesResponse,
  PostModelsEndpointsRequest,
  PostModelsEndpointsResponse,
  GetNewTestRequest,
  GetNewTestResponse,
  PostPackByAgentnameRequest,
  PostPackByAgentnameResponse,
  GetPackByAgentnameAnalyzeRequest,
  GetPackByAgentnameAnalyzeResponse,
  GetPackByAgentnameMetadataRequest,
  GetPackByAgentnameMetadataResponse,
  GetPackByAgentnamePackedInfoRequest,
  GetPackByAgentnamePackedInfoResponse,
  PostPackByAgentnamePublishRequest,
  PostPackByAgentnamePublishResponse,
  GetPackNpmTokenStatusRequest,
  GetPackNpmTokenStatusResponse,
  PostPlatformAuthBootstrapRequest,
  PostPlatformAuthBootstrapResponse,
  PostPlatformAuthLoginRequest,
  PostPlatformAuthLoginResponse,
  PostPlatformAuthLogoutRequest,
  PostPlatformAuthLogoutResponse,
  GetPlatformAuthMeRequest,
  GetPlatformAuthMeResponse,
  GetPlatformEndpointRequest,
  GetPlatformEndpointResponse,
  DeletePlatformSessionWildcardRequest,
  DeletePlatformSessionWildcardResponse,
  GetPlatformSessionWildcardRequest,
  GetPlatformSessionWildcardResponse,
  PatchPlatformSessionWildcardRequest,
  PatchPlatformSessionWildcardResponse,
  PostPlatformSessionWildcardRequest,
  PostPlatformSessionWildcardResponse,
  PutPlatformSessionWildcardRequest,
  PutPlatformSessionWildcardResponse,
  DeletePlatformWildcardRequest,
  DeletePlatformWildcardResponse,
  GetPlatformWildcardRequest,
  GetPlatformWildcardResponse,
  PatchPlatformWildcardRequest,
  PatchPlatformWildcardResponse,
  PostPlatformWildcardRequest,
  PostPlatformWildcardResponse,
  PutPlatformWildcardRequest,
  PutPlatformWildcardResponse,
  GetPromptsRequest,
  GetPromptsResponse,
  GetPromptsByNameRequest,
  GetPromptsByNameResponse,
  GetPromptsByNameTenvsRequest,
  GetPromptsByNameTenvsResponse,
  GetProvidersRequest,
  GetProvidersResponse,
  GetProvidersByNameIconRequest,
  GetProvidersByNameIconResponse,
  GetProvidersByNameToolsRequest,
  GetProvidersByNameToolsResponse,
  GetSkillsRequest,
  GetSkillsResponse,
  PostSkillsRequest,
  PostSkillsResponse,
  DeleteSkillsByNameRequest,
  DeleteSkillsByNameResponse,
  GetSkillsByNameRequest,
  GetSkillsByNameResponse,
  PatchSkillsByNameRequest,
  PatchSkillsByNameResponse,
  GetSkillsByNameFilesWildcardRequest,
  GetSkillsByNameFilesWildcardResponse,
  GetThreadsRequest,
  GetThreadsResponse,
  PostThreadsRequest,
  PostThreadsResponse,
  DeleteThreadsByIdRequest,
  DeleteThreadsByIdResponse,
  GetThreadsByIdRequest,
  GetThreadsByIdResponse,
  PatchThreadsByIdRequest,
  PatchThreadsByIdResponse,
  GetThreadsByIdBridgeRequest,
  GetThreadsByIdBridgeResponse,
  PostThreadsByIdContinueRequest,
  PostThreadsByIdContinueResponse,
  GetThreadsByIdCostRequest,
  GetThreadsByIdCostResponse,
  GetThreadsByIdDiagnosticsRequest,
  GetThreadsByIdDiagnosticsResponse,
  GetThreadsByIdEffectsRequest,
  GetThreadsByIdEffectsResponse,
  PostThreadsByIdEffectsByEffectidCancelRequest,
  PostThreadsByIdEffectsByEffectidCancelResponse,
  PostThreadsByIdEffectsByEffectidRunRequest,
  PostThreadsByIdEffectsByEffectidRunResponse,
  GetThreadsByIdFsRequest,
  GetThreadsByIdFsResponse,
  DeleteThreadsByIdFsWildcardRequest,
  DeleteThreadsByIdFsWildcardResponse,
  GetThreadsByIdFsWildcardRequest,
  GetThreadsByIdFsWildcardResponse,
  PostThreadsByIdFsWildcardRequest,
  PostThreadsByIdFsWildcardResponse,
  DeleteThreadsByIdKvRequest,
  DeleteThreadsByIdKvResponse,
  GetThreadsByIdKvRequest,
  GetThreadsByIdKvResponse,
  PostThreadsByIdKvRequest,
  PostThreadsByIdKvResponse,
  GetThreadsByIdLogsRequest,
  GetThreadsByIdLogsResponse,
  GetThreadsByIdLogsByLogidRequest,
  GetThreadsByIdLogsByLogidResponse,
  GetThreadsByIdLogsByLogidInspectByProviderRequest,
  GetThreadsByIdLogsByLogidInspectByProviderResponse,
  GetThreadsByIdMessagesRequest,
  GetThreadsByIdMessagesResponse,
  PostThreadsByIdMessagesRequest,
  PostThreadsByIdMessagesResponse,
  DeleteThreadsByIdMessagesByMessageidRequest,
  DeleteThreadsByIdMessagesByMessageidResponse,
  PatchThreadsByIdMessagesByMessageidRequest,
  PatchThreadsByIdMessagesByMessageidResponse,
  GetThreadsByIdPendingToolCallsRequest,
  GetThreadsByIdPendingToolCallsResponse,
  PostThreadsByIdReviveRequest,
  PostThreadsByIdReviveResponse,
  PostThreadsByIdRpcRequest,
  PostThreadsByIdRpcResponse,
  PostThreadsByIdStopRequest,
  PostThreadsByIdStopResponse,
  GetThreadsByIdStreamRequest,
  GetThreadsByIdStreamResponse,
  GetThreadsByIdSubagentsRequest,
  GetThreadsByIdSubagentsResponse,
  PostThreadsByIdToolResultRequest,
  PostThreadsByIdToolResultResponse,
  GetThreadsByIdVariablesByRequestidRequest,
  GetThreadsByIdVariablesByRequestidResponse,
  PostThreadsByIdVariablesByRequestidRequest,
  PostThreadsByIdVariablesByRequestidResponse,
  GetToolsRequest,
  GetToolsResponse,
  GetToolsByNameRequest,
  GetToolsByNameResponse,
  PostUnpackByPackageidRequest,
  PostUnpackByPackageidResponse,
  GetUnpackByPackageidAnalyzeRequest,
  GetUnpackByPackageidAnalyzeResponse,
  GetUsersRequest,
  GetUsersResponse,
  PostUsersRequest,
  PostUsersResponse,
  DeleteUsersByIdRequest,
  DeleteUsersByIdResponse,
  PutUsersByIdRequest,
  PutUsersByIdResponse,
  DeleteUsersByIdWildcardRequest,
  DeleteUsersByIdWildcardResponse,
  GetUsersByIdWildcardRequest,
  GetUsersByIdWildcardResponse,
  PatchUsersByIdWildcardRequest,
  PatchUsersByIdWildcardResponse,
  PostUsersByIdWildcardRequest,
  PostUsersByIdWildcardResponse,
  PutUsersByIdWildcardRequest,
  PutUsersByIdWildcardResponse,
  GetUsersByIdEnvRequest,
  GetUsersByIdEnvResponse,
  PatchUsersByIdEnvRequest,
  PatchUsersByIdEnvResponse,
  GetUsersByIdStreamRequest,
  GetUsersByIdStreamResponse,
  DeleteUsersMeWildcardRequest,
  DeleteUsersMeWildcardResponse,
  GetUsersMeWildcardRequest,
  GetUsersMeWildcardResponse,
  PatchUsersMeWildcardRequest,
  PatchUsersMeWildcardResponse,
  PostUsersMeWildcardRequest,
  PostUsersMeWildcardResponse,
  PutUsersMeWildcardRequest,
  PutUsersMeWildcardResponse,
  GetUsersMeEnvRequest,
  GetUsersMeEnvResponse,
  PatchUsersMeEnvRequest,
  PatchUsersMeEnvResponse,
  GetUsersMeHubRequest,
  GetUsersMeHubResponse,
  DeleteUsersMeKvRequest,
  DeleteUsersMeKvResponse,
  GetUsersMeKvRequest,
  GetUsersMeKvResponse,
  PostUsersMeKvRequest,
  PostUsersMeKvResponse,
  GetUsersMeStreamRequest,
  GetUsersMeStreamResponse,
  GetVariablesAgentsByNameRequest,
  GetVariablesAgentsByNameResponse,
  GetVariablesPromptsByNameRequest,
  GetVariablesPromptsByNameResponse,
  GetVariablesToolsByNameRequest,
  GetVariablesToolsByNameResponse,
} from './types';

export class AgentBuilderApi {
  public readonly baseUrl: string;
  public readonly token?: string;
  private onUnauthorized?: () => void;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.token = options.token;
    this.onUnauthorized = options.onUnauthorized;
  }

  private async request<T>(method: string, path: string, { query, body }: { query?: Record<string, unknown>; body?: unknown } = {}): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    if (query) {
      const qs = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => { if (v !== undefined && v !== null) qs.append(k, String(v)); });
      const q = qs.toString();
      if (q) url += `?${q}`;
    }
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) headers.Authorization = `Bearer ${this.token}`;
    const init: RequestInit = { method, headers };
    if (body !== undefined) init.body = JSON.stringify(body);
    const res = await fetch(url, init);
    if (res.status === 401 && this.onUnauthorized) this.onUnauthorized();
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      const err: ApiError = { status: res.status, message: `${method} ${path} failed: ${res.statusText}`, body: text };
      throw err;
    }
    if (res.status === 204 || res.headers.get('content-length') === '0') return undefined as T;
    return (await res.json()) as T;
  }

  get agents() { return new AgentsNamespace(this); }
  get api_keys() { return new ApiKeysNamespace(this); }
  get auth() { return new AuthNamespace(this); }
  get config() { return new ConfigNamespace(this); }
  get diagnostics() { return new DiagnosticsNamespace(this); }
  get hooks() { return new HooksNamespace(this); }
  get marketplace() { return new MarketplaceNamespace(this); }
  get models() { return new ModelsNamespace(this); }
  get pack() { return new PackNamespace(this); }
  get platformAuth() { return new PlatformauthNamespace(this); }
  get prompts() { return new PromptsNamespace(this); }
  get providers() { return new ProvidersNamespace(this); }
  get root() { return new RootNamespace(this); }
  get skills() { return new SkillsNamespace(this); }
  get streaming() { return new StreamingNamespace(this); }
  get threads() { return new ThreadsNamespace(this); }
  get tools() { return new ToolsNamespace(this); }
  get unpack() { return new UnpackNamespace(this); }
  get users() { return new UsersNamespace(this); }
  get variables() { return new VariablesNamespace(this); }
}

class AgentsNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetAgentsRequest): Promise<GetAgentsResponse> {
    return this.api.request('GET', `/api/agents`, { query: undefined, body: undefined });
  }

  async get(req: GetAgentsByNameRequest): Promise<GetAgentsByNameResponse> {
    return this.api.request('GET', `/api/agents/${req.name}`, { query: undefined, body: undefined });
  }

  async getTenvs(req: GetAgentsByNameTenvsRequest): Promise<GetAgentsByNameTenvsResponse> {
    const query = {
      thread_id: req.thread_id,
    };
    return this.api.request('GET', `/api/agents/${req.name}/tenvs`, { query: query, body: undefined });
  }

}

class ApiKeysNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetApiKeysRequest): Promise<GetApiKeysResponse> {
    return this.api.request('GET', `/api/api-keys`, { query: undefined, body: undefined });
  }

  async create(req: PostApiKeysRequest): Promise<PostApiKeysResponse> {
    const body = {
      name: req.name,
    };
    return this.api.request('POST', `/api/api-keys`, { query: undefined, body: body });
  }

  async delete(req: DeleteApiKeysByIdRequest): Promise<DeleteApiKeysByIdResponse> {
    return this.api.request('DELETE', `/api/api-keys/${req.id}`, { query: undefined, body: undefined });
  }

}

class AuthNamespace {
  constructor(private api: AgentBuilderApi) {}

  async bootstrap(req: PostAuthBootstrapRequest): Promise<PostAuthBootstrapResponse> {
    return this.api.request('POST', `/api/auth/bootstrap`, { query: undefined, body: undefined });
  }

  async config(req: GetAuthConfigRequest): Promise<GetAuthConfigResponse> {
    return this.api.request('GET', `/api/auth/config`, { query: undefined, body: undefined });
  }

  async device(req: GetAuthDeviceByCodeRequest): Promise<GetAuthDeviceByCodeResponse> {
    return this.api.request('GET', `/api/auth/device/${req.code}`, { query: undefined, body: undefined });
  }

  async deviceApprove(req: GetAuthDeviceByCodeApproveRequest): Promise<GetAuthDeviceByCodeApproveResponse> {
    const query = {
      handoff: req.handoff,
    };
    return this.api.request('GET', `/api/auth/device/${req.code}/approve`, { query: query, body: undefined });
  }

  async startDevice(req: PostAuthDeviceStartRequest): Promise<PostAuthDeviceStartResponse> {
    return this.api.request('POST', `/api/auth/device/start`, { query: undefined, body: undefined });
  }

  async login(req: PostAuthLoginRequest): Promise<PostAuthLoginResponse> {
    const body = {
      username: req.username,
      password: req.password,
    };
    return this.api.request('POST', `/api/auth/login`, { query: undefined, body: body });
  }

  async getLogout(req: GetAuthLogoutRequest): Promise<GetAuthLogoutResponse> {
    const query = {
      return_to: req.return_to,
    };
    return this.api.request('GET', `/api/auth/logout`, { query: query, body: undefined });
  }

  async logout(req: PostAuthLogoutRequest): Promise<PostAuthLogoutResponse> {
    return this.api.request('POST', `/api/auth/logout`, { query: undefined, body: undefined });
  }

  async me(req: GetAuthMeRequest): Promise<GetAuthMeResponse> {
    return this.api.request('GET', `/api/auth/me`, { query: undefined, body: undefined });
  }

  async platformCleanup(req: PostAuthPlatformCleanupRequest): Promise<PostAuthPlatformCleanupResponse> {
    const body = {
      kind: req.kind,
      project_id: req.project_id,
      exp: req.exp,
      key: req.key,
      id: req.id,
      params: req.params,
      limit: req.limit,
      offset: req.offset,
    };
    return this.api.request('POST', `/api/auth/platform-cleanup`, { query: undefined, body: body });
  }

  async platformReplica(req: PostAuthPlatformReplicaRequest): Promise<PostAuthPlatformReplicaResponse> {
    const body = {
      kind: req.kind,
      project_id: req.project_id,
      exp: req.exp,
      users: req.users,
      platform_user_id: req.platform_user_id,
      username: req.username,
      display_name: req.display_name,
      email: req.email,
      avatar_url: req.avatar_url,
      role: req.role,
      permissions: req.permissions,
      session_revoked_at: req.session_revoked_at,
    };
    return this.api.request('POST', `/api/auth/platform-replica`, { query: undefined, body: body });
  }

  async saCallback(req: GetAuthSaCallbackRequest): Promise<GetAuthSaCallbackResponse> {
    const query = {
      handoff: req.handoff,
      token: req.token,
      return_to: req.return_to,
    };
    return this.api.request('GET', `/api/auth/sa/callback`, { query: query, body: undefined });
  }

  async saStart(req: GetAuthSaStartRequest): Promise<GetAuthSaStartResponse> {
    const query = {
      return_to: req.return_to,
    };
    return this.api.request('GET', `/api/auth/sa/start`, { query: query, body: undefined });
  }

}

class ConfigNamespace {
  constructor(private api: AgentBuilderApi) {}

  async config(req: GetConfigRequest): Promise<GetConfigResponse> {
    return this.api.request('GET', `/api/config`, { query: undefined, body: undefined });
  }

  async instance(req: GetEnvsInstanceRequest): Promise<GetEnvsInstanceResponse> {
    return this.api.request('GET', `/api/envs/instance`, { query: undefined, body: undefined });
  }

  async updateInstance(req: PatchEnvsInstanceRequest): Promise<PatchEnvsInstanceResponse> {
    return this.api.request('PATCH', `/api/envs/instance`, { query: undefined, body: undefined });
  }

}

class DiagnosticsNamespace {
  constructor(private api: AgentBuilderApi) {}

  async diagnostics(req: GetDiagnosticsRequest): Promise<GetDiagnosticsResponse> {
    return this.api.request('GET', `/api/diagnostics`, { query: undefined, body: undefined });
  }

  async newTest(req: GetNewTestRequest): Promise<GetNewTestResponse> {
    return this.api.request('GET', `/api/new-test`, { query: undefined, body: undefined });
  }

}

class HooksNamespace {
  constructor(private api: AgentBuilderApi) {}

  async hooks(req: GetHooksRequest): Promise<GetHooksResponse> {
    return this.api.request('GET', `/api/hooks`, { query: undefined, body: undefined });
  }

}

class MarketplaceNamespace {
  constructor(private api: AgentBuilderApi) {}

  async getPlatformEndpoint(req: GetPlatformEndpointRequest): Promise<GetPlatformEndpointResponse> {
    return this.api.request('GET', `/api/platform-endpoint`, { query: undefined, body: undefined });
  }

  async deleteProxyPlatformSession(req: DeletePlatformSessionWildcardRequest): Promise<DeletePlatformSessionWildcardResponse> {
    return this.api.request('DELETE', `/api/platform-session${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async getProxyPlatformSession(req: GetPlatformSessionWildcardRequest): Promise<GetPlatformSessionWildcardResponse> {
    return this.api.request('GET', `/api/platform-session${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async patchProxyPlatformSession(req: PatchPlatformSessionWildcardRequest): Promise<PatchPlatformSessionWildcardResponse> {
    return this.api.request('PATCH', `/api/platform-session${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async postProxyPlatformSession(req: PostPlatformSessionWildcardRequest): Promise<PostPlatformSessionWildcardResponse> {
    return this.api.request('POST', `/api/platform-session${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async putProxyPlatformSession(req: PutPlatformSessionWildcardRequest): Promise<PutPlatformSessionWildcardResponse> {
    return this.api.request('PUT', `/api/platform-session${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async deleteProxyPlatform(req: DeletePlatformWildcardRequest): Promise<DeletePlatformWildcardResponse> {
    return this.api.request('DELETE', `/api/platform${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async getProxyPlatform(req: GetPlatformWildcardRequest): Promise<GetPlatformWildcardResponse> {
    return this.api.request('GET', `/api/platform${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async patchProxyPlatform(req: PatchPlatformWildcardRequest): Promise<PatchPlatformWildcardResponse> {
    return this.api.request('PATCH', `/api/platform${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async postProxyPlatform(req: PostPlatformWildcardRequest): Promise<PostPlatformWildcardResponse> {
    return this.api.request('POST', `/api/platform${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async putProxyPlatform(req: PutPlatformWildcardRequest): Promise<PutPlatformWildcardResponse> {
    return this.api.request('PUT', `/api/platform${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

}

class ModelsNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetModelsRequest): Promise<GetModelsResponse> {
    return this.api.request('GET', `/api/models`, { query: undefined, body: undefined });
  }

  async get(req: GetModelsByNameRequest): Promise<GetModelsByNameResponse> {
    return this.api.request('GET', `/api/models/${req.name}`, { query: undefined, body: undefined });
  }

  async getCurlData(req: GetModelsByNameCurlDataRequest): Promise<GetModelsByNameCurlDataResponse> {
    return this.api.request('GET', `/api/models/${req.name}/curl-data`, { query: undefined, body: undefined });
  }

  async available(req: PostModelsAvailableRequest): Promise<PostModelsAvailableResponse> {
    const body = {
      search: req.search,
      page: req.page,
      perPage: req.perPage,
      models: req.models,
      hasNextPage: req.hasNextPage,
      provider: req.provider,
      filter: req.filter,
    };
    return this.api.request('POST', `/api/models/available`, { query: undefined, body: body });
  }

  async capabilities(req: PostModelsCapabilitiesRequest): Promise<PostModelsCapabilitiesResponse> {
    const body = {
      provider: req.provider,
      modelId: req.modelId,
    };
    return this.api.request('POST', `/api/models/capabilities`, { query: undefined, body: body });
  }

  async endpoints(req: PostModelsEndpointsRequest): Promise<PostModelsEndpointsResponse> {
    const body = {
      provider: req.provider,
      modelSlug: req.modelSlug,
    };
    return this.api.request('POST', `/api/models/endpoints`, { query: undefined, body: body });
  }

}

class PackNamespace {
  constructor(private api: AgentBuilderApi) {}

  async pack(req: PostPackByAgentnameRequest): Promise<PostPackByAgentnameResponse> {
    return this.api.request('POST', `/api/pack/${req.agentName}`, { query: undefined, body: undefined });
  }

  async getAnalyze(req: GetPackByAgentnameAnalyzeRequest): Promise<GetPackByAgentnameAnalyzeResponse> {
    return this.api.request('GET', `/api/pack/${req.agentName}/analyze`, { query: undefined, body: undefined });
  }

  async getMetadata(req: GetPackByAgentnameMetadataRequest): Promise<GetPackByAgentnameMetadataResponse> {
    return this.api.request('GET', `/api/pack/${req.agentName}/metadata`, { query: undefined, body: undefined });
  }

  async getPackedInfo(req: GetPackByAgentnamePackedInfoRequest): Promise<GetPackByAgentnamePackedInfoResponse> {
    return this.api.request('GET', `/api/pack/${req.agentName}/packed-info`, { query: undefined, body: undefined });
  }

  async publish(req: PostPackByAgentnamePublishRequest): Promise<PostPackByAgentnamePublishResponse> {
    return this.api.request('POST', `/api/pack/${req.agentName}/publish`, { query: undefined, body: undefined });
  }

  async getNpmTokenStatus(req: GetPackNpmTokenStatusRequest): Promise<GetPackNpmTokenStatusResponse> {
    return this.api.request('GET', `/api/pack/npm-token-status`, { query: undefined, body: undefined });
  }

}

class PlatformauthNamespace {
  constructor(private api: AgentBuilderApi) {}

  async bootstrap(req: PostPlatformAuthBootstrapRequest): Promise<PostPlatformAuthBootstrapResponse> {
    return this.api.request('POST', `/api/platform-auth/bootstrap`, { query: undefined, body: undefined });
  }

  async login(req: PostPlatformAuthLoginRequest): Promise<PostPlatformAuthLoginResponse> {
    return this.api.request('POST', `/api/platform-auth/login`, { query: undefined, body: undefined });
  }

  async logout(req: PostPlatformAuthLogoutRequest): Promise<PostPlatformAuthLogoutResponse> {
    return this.api.request('POST', `/api/platform-auth/logout`, { query: undefined, body: undefined });
  }

  async me(req: GetPlatformAuthMeRequest): Promise<GetPlatformAuthMeResponse> {
    return this.api.request('GET', `/api/platform-auth/me`, { query: undefined, body: undefined });
  }

}

class PromptsNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetPromptsRequest): Promise<GetPromptsResponse> {
    return this.api.request('GET', `/api/prompts`, { query: undefined, body: undefined });
  }

  async get(req: GetPromptsByNameRequest): Promise<GetPromptsByNameResponse> {
    return this.api.request('GET', `/api/prompts/${req.name}`, { query: undefined, body: undefined });
  }

  async getTenvs(req: GetPromptsByNameTenvsRequest): Promise<GetPromptsByNameTenvsResponse> {
    const query = {
      thread_id: req.thread_id,
    };
    return this.api.request('GET', `/api/prompts/${req.name}/tenvs`, { query: query, body: undefined });
  }

}

class ProvidersNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetProvidersRequest): Promise<GetProvidersResponse> {
    return this.api.request('GET', `/api/providers`, { query: undefined, body: undefined });
  }

  async getIcon(req: GetProvidersByNameIconRequest): Promise<GetProvidersByNameIconResponse> {
    const query = {
      model: req.model,
    };
    return this.api.request('GET', `/api/providers/${req.name}/icon`, { query: query, body: undefined });
  }

  async getTools(req: GetProvidersByNameToolsRequest): Promise<GetProvidersByNameToolsResponse> {
    const query = {
      model: req.model,
    };
    return this.api.request('GET', `/api/providers/${req.name}/tools`, { query: query, body: undefined });
  }

}

class RootNamespace {
  constructor(private api: AgentBuilderApi) {}

  async postIndex(req: PostRequest): Promise<PostResponse> {
    return this.api.request('POST', `/api`, { query: undefined, body: undefined });
  }

}

class SkillsNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetSkillsRequest): Promise<GetSkillsResponse> {
    const query = {
      all: req.all,
    };
    return this.api.request('GET', `/api/skills`, { query: query, body: undefined });
  }

  async create(req: PostSkillsRequest): Promise<PostSkillsResponse> {
    return this.api.request('POST', `/api/skills`, { query: undefined, body: undefined });
  }

  async delete(req: DeleteSkillsByNameRequest): Promise<DeleteSkillsByNameResponse> {
    return this.api.request('DELETE', `/api/skills/${req.name}`, { query: undefined, body: undefined });
  }

  async get(req: GetSkillsByNameRequest): Promise<GetSkillsByNameResponse> {
    return this.api.request('GET', `/api/skills/${req.name}`, { query: undefined, body: undefined });
  }

  async update(req: PatchSkillsByNameRequest): Promise<PatchSkillsByNameResponse> {
    return this.api.request('PATCH', `/api/skills/${req.name}`, { query: undefined, body: undefined });
  }

  async proxyFiles(req: GetSkillsByNameFilesWildcardRequest): Promise<GetSkillsByNameFilesWildcardResponse> {
    return this.api.request('GET', `/api/skills/${req.name}/files${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

}

class StreamingNamespace {
  constructor(private api: AgentBuilderApi) {}

  async events(req: GetEventsRequest): Promise<GetEventsResponse> {
    return this.api.request('GET', `/api/events`, { query: undefined, body: undefined });
  }

}

class ThreadsNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetThreadsRequest): Promise<GetThreadsResponse> {
    const query = {
      limit: req.limit,
      offset: req.offset,
      agent_id: req.agent_id,
      include_children: req.include_children,
      search: req.search,
      startDate: req.startDate,
      endDate: req.endDate,
    };
    return this.api.request('GET', `/api/threads`, { query: query, body: undefined });
  }

  async create(req: PostThreadsRequest): Promise<PostThreadsResponse> {
    const body = {
      agent_id: req.agent_id,
      initial_messages: req.initial_messages,
      data: req.data,
      tags: req.tags,
      env: req.env,
      env_types: req.env_types,
      tenvs: req.tenvs,
      properties: req.properties,
    };
    return this.api.request('POST', `/api/threads`, { query: undefined, body: body });
  }

  async delete(req: DeleteThreadsByIdRequest): Promise<DeleteThreadsByIdResponse> {
    return this.api.request('DELETE', `/api/threads/${req.id}`, { query: undefined, body: undefined });
  }

  async get(req: GetThreadsByIdRequest): Promise<GetThreadsByIdResponse> {
    return this.api.request('GET', `/api/threads/${req.id}`, { query: undefined, body: undefined });
  }

  async update(req: PatchThreadsByIdRequest): Promise<PatchThreadsByIdResponse> {
    const body = {
      tags: req.tags,
      agent_id: req.agent_id,
      env: req.env,
      env_types: req.env_types,
      env_patch: req.env_patch,
      env_type_patch: req.env_type_patch,
      env_delete: req.env_delete,
      tenvs: req.tenvs,
    };
    return this.api.request('PATCH', `/api/threads/${req.id}`, { query: undefined, body: body });
  }

  async bridge(req: GetThreadsByIdBridgeRequest): Promise<GetThreadsByIdBridgeResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/bridge`, { query: undefined, body: undefined });
  }

  async continue(req: PostThreadsByIdContinueRequest): Promise<PostThreadsByIdContinueResponse> {
    return this.api.request('POST', `/api/threads/${req.id}/continue`, { query: undefined, body: undefined });
  }

  async getCost(req: GetThreadsByIdCostRequest): Promise<GetThreadsByIdCostResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/cost`, { query: undefined, body: undefined });
  }

  async getDiagnostics(req: GetThreadsByIdDiagnosticsRequest): Promise<GetThreadsByIdDiagnosticsResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/diagnostics`, { query: undefined, body: undefined });
  }

  async getEffects(req: GetThreadsByIdEffectsRequest): Promise<GetThreadsByIdEffectsResponse> {
    const query = {
      limit: req.limit,
      offset: req.offset,
    };
    return this.api.request('GET', `/api/threads/${req.id}/effects`, { query: query, body: undefined });
  }

  async cancelEffect(req: PostThreadsByIdEffectsByEffectidCancelRequest): Promise<PostThreadsByIdEffectsByEffectidCancelResponse> {
    return this.api.request('POST', `/api/threads/${req.id}/effects/${req.effectId}/cancel`, { query: undefined, body: undefined });
  }

  async runEffect(req: PostThreadsByIdEffectsByEffectidRunRequest): Promise<PostThreadsByIdEffectsByEffectidRunResponse> {
    return this.api.request('POST', `/api/threads/${req.id}/effects/${req.effectId}/run`, { query: undefined, body: undefined });
  }

  async getFs(req: GetThreadsByIdFsRequest): Promise<GetThreadsByIdFsResponse> {
    const query = {
      grep: req.grep,
      path: req.path,
      limit: req.limit,
      find: req.find,
      type: req.type,
    };
    return this.api.request('GET', `/api/threads/${req.id}/fs`, { query: query, body: undefined });
  }

  async deleteProxyFs(req: DeleteThreadsByIdFsWildcardRequest): Promise<DeleteThreadsByIdFsWildcardResponse> {
    const query = {
      format: req.format,
    };
    return this.api.request('DELETE', `/api/threads/${req.id}/fs${req.rest ? '/' + req.rest : ''}`, { query: query, body: undefined });
  }

  async getProxyFs(req: GetThreadsByIdFsWildcardRequest): Promise<GetThreadsByIdFsWildcardResponse> {
    const query = {
      format: req.format,
    };
    return this.api.request('GET', `/api/threads/${req.id}/fs${req.rest ? '/' + req.rest : ''}`, { query: query, body: undefined });
  }

  async postProxyFs(req: PostThreadsByIdFsWildcardRequest): Promise<PostThreadsByIdFsWildcardResponse> {
    const query = {
      format: req.format,
    };
    return this.api.request('POST', `/api/threads/${req.id}/fs${req.rest ? '/' + req.rest : ''}`, { query: query, body: undefined });
  }

  async deleteKv(req: DeleteThreadsByIdKvRequest): Promise<DeleteThreadsByIdKvResponse> {
    const query = {
      key: req.key,
      search: req.search,
      limit: req.limit,
      offset: req.offset,
    };
    return this.api.request('DELETE', `/api/threads/${req.id}/kv`, { query: query, body: undefined });
  }

  async getKv(req: GetThreadsByIdKvRequest): Promise<GetThreadsByIdKvResponse> {
    const query = {
      key: req.key,
      search: req.search,
      limit: req.limit,
      offset: req.offset,
    };
    return this.api.request('GET', `/api/threads/${req.id}/kv`, { query: query, body: undefined });
  }

  async setKv(req: PostThreadsByIdKvRequest): Promise<PostThreadsByIdKvResponse> {
    const query = {
      key: req.key,
      search: req.search,
      limit: req.limit,
      offset: req.offset,
    };
    return this.api.request('POST', `/api/threads/${req.id}/kv`, { query: query, body: undefined });
  }

  async logs(req: GetThreadsByIdLogsRequest): Promise<GetThreadsByIdLogsResponse> {
    const query = {
      limit: req.limit,
      offset: req.offset,
      order: req.order,
      ids: req.ids,
      messageIds: req.messageIds,
      includeWorkblocks: req.includeWorkblocks,
      includeDescendants: req.includeDescendants,
    };
    return this.api.request('GET', `/api/threads/${req.id}/logs`, { query: query, body: undefined });
  }

  async getLog(req: GetThreadsByIdLogsByLogidRequest): Promise<GetThreadsByIdLogsByLogidResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/logs/${req.logId}`, { query: undefined, body: undefined });
  }

  async inspectLog(req: GetThreadsByIdLogsByLogidInspectByProviderRequest): Promise<GetThreadsByIdLogsByLogidInspectByProviderResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/logs/${req.logId}/inspect/${req.provider}`, { query: undefined, body: undefined });
  }

  async getMessages(req: GetThreadsByIdMessagesRequest): Promise<GetThreadsByIdMessagesResponse> {
    const query = {
      limit: req.limit,
      offset: req.offset,
      order: req.order,
      includeSilent: req.includeSilent,
      depth: req.depth,
      ids: req.ids,
      includeWorkblocks: req.includeWorkblocks,
    };
    return this.api.request('GET', `/api/threads/${req.id}/messages`, { query: query, body: undefined });
  }

  async createMessage(req: PostThreadsByIdMessagesRequest): Promise<PostThreadsByIdMessagesResponse> {
    const body = {
      name: req.name,
      mimeType: req.mimeType,
      data: req.data,
      width: req.width,
      height: req.height,
      thumbnail: req.thumbnail,
      content: req.content,
      role: req.role,
      attachments: req.attachments,
      silent: req.silent,
      content: req.content,
    };
    return this.api.request('POST', `/api/threads/${req.id}/messages`, { query: undefined, body: body });
  }

  async deleteMessage(req: DeleteThreadsByIdMessagesByMessageidRequest): Promise<DeleteThreadsByIdMessagesByMessageidResponse> {
    return this.api.request('DELETE', `/api/threads/${req.id}/messages/${req.messageId}`, { query: undefined, body: undefined });
  }

  async updateMessages(req: PatchThreadsByIdMessagesByMessageidRequest): Promise<PatchThreadsByIdMessagesByMessageidResponse> {
    return this.api.request('PATCH', `/api/threads/${req.id}/messages/${req.messageId}`, { query: undefined, body: undefined });
  }

  async getPendingToolCalls(req: GetThreadsByIdPendingToolCallsRequest): Promise<GetThreadsByIdPendingToolCallsResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/pending-tool-calls`, { query: undefined, body: undefined });
  }

  async revive(req: PostThreadsByIdReviveRequest): Promise<PostThreadsByIdReviveResponse> {
    return this.api.request('POST', `/api/threads/${req.id}/revive`, { query: undefined, body: undefined });
  }

  async rpc(req: PostThreadsByIdRpcRequest): Promise<PostThreadsByIdRpcResponse> {
    const body = {
      method: req.method,
      args: req.args,
    };
    return this.api.request('POST', `/api/threads/${req.id}/rpc`, { query: undefined, body: body });
  }

  async stop(req: PostThreadsByIdStopRequest): Promise<PostThreadsByIdStopResponse> {
    return this.api.request('POST', `/api/threads/${req.id}/stop`, { query: undefined, body: undefined });
  }

  async stream(req: GetThreadsByIdStreamRequest): Promise<GetThreadsByIdStreamResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/stream`, { query: undefined, body: undefined });
  }

  async getSubagents(req: GetThreadsByIdSubagentsRequest): Promise<GetThreadsByIdSubagentsResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/subagents`, { query: undefined, body: undefined });
  }

  async toolResult(req: PostThreadsByIdToolResultRequest): Promise<PostThreadsByIdToolResultResponse> {
    return this.api.request('POST', `/api/threads/${req.id}/tool-result`, { query: undefined, body: undefined });
  }

  async getVariables(req: GetThreadsByIdVariablesByRequestidRequest): Promise<GetThreadsByIdVariablesByRequestidResponse> {
    return this.api.request('GET', `/api/threads/${req.id}/variables/${req.requestId}`, { query: undefined, body: undefined });
  }

  async setVariables(req: PostThreadsByIdVariablesByRequestidRequest): Promise<PostThreadsByIdVariablesByRequestidResponse> {
    return this.api.request('POST', `/api/threads/${req.id}/variables/${req.requestId}`, { query: undefined, body: undefined });
  }

}

class ToolsNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetToolsRequest): Promise<GetToolsResponse> {
    const query = {
      type: req.type,
      schema: req.schema,
    };
    return this.api.request('GET', `/api/tools`, { query: query, body: undefined });
  }

  async get(req: GetToolsByNameRequest): Promise<GetToolsByNameResponse> {
    return this.api.request('GET', `/api/tools/${req.name}`, { query: undefined, body: undefined });
  }

}

class UnpackNamespace {
  constructor(private api: AgentBuilderApi) {}

  async unpack(req: PostUnpackByPackageidRequest): Promise<PostUnpackByPackageidResponse> {
    return this.api.request('POST', `/api/unpack/${req.packageId}`, { query: undefined, body: undefined });
  }

  async getAnalyze(req: GetUnpackByPackageidAnalyzeRequest): Promise<GetUnpackByPackageidAnalyzeResponse> {
    return this.api.request('GET', `/api/unpack/${req.packageId}/analyze`, { query: undefined, body: undefined });
  }

}

class UsersNamespace {
  constructor(private api: AgentBuilderApi) {}

  async list(req: GetUsersRequest): Promise<GetUsersResponse> {
    return this.api.request('GET', `/api/users`, { query: undefined, body: undefined });
  }

  async create(req: PostUsersRequest): Promise<PostUsersResponse> {
    const body = {
      username: req.username,
      password: req.password,
      role: req.role,
    };
    return this.api.request('POST', `/api/users`, { query: undefined, body: body });
  }

  async delete(req: DeleteUsersByIdRequest): Promise<DeleteUsersByIdResponse> {
    return this.api.request('DELETE', `/api/users/${req.id}`, { query: undefined, body: undefined });
  }

  async replace(req: PutUsersByIdRequest): Promise<PutUsersByIdResponse> {
    const body = {
      username: req.username,
      password: req.password,
      role: req.role,
      permissions: req.permissions,
    };
    return this.api.request('PUT', `/api/users/${req.id}`, { query: undefined, body: body });
  }

  async deleteProxy(req: DeleteUsersByIdWildcardRequest): Promise<DeleteUsersByIdWildcardResponse> {
    return this.api.request('DELETE', `/api/users/${req.id}${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async getProxy(req: GetUsersByIdWildcardRequest): Promise<GetUsersByIdWildcardResponse> {
    return this.api.request('GET', `/api/users/${req.id}${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async patchProxy(req: PatchUsersByIdWildcardRequest): Promise<PatchUsersByIdWildcardResponse> {
    return this.api.request('PATCH', `/api/users/${req.id}${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async postProxy(req: PostUsersByIdWildcardRequest): Promise<PostUsersByIdWildcardResponse> {
    return this.api.request('POST', `/api/users/${req.id}${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async putProxy(req: PutUsersByIdWildcardRequest): Promise<PutUsersByIdWildcardResponse> {
    return this.api.request('PUT', `/api/users/${req.id}${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async getEnv(req: GetUsersByIdEnvRequest): Promise<GetUsersByIdEnvResponse> {
    return this.api.request('GET', `/api/users/${req.id}/env`, { query: undefined, body: undefined });
  }

  async updateEnv(req: PatchUsersByIdEnvRequest): Promise<PatchUsersByIdEnvResponse> {
    return this.api.request('PATCH', `/api/users/${req.id}/env`, { query: undefined, body: undefined });
  }

  async getStream(req: GetUsersByIdStreamRequest): Promise<GetUsersByIdStreamResponse> {
    return this.api.request('GET', `/api/users/${req.id}/stream`, { query: undefined, body: undefined });
  }

  async deleteProxyMe(req: DeleteUsersMeWildcardRequest): Promise<DeleteUsersMeWildcardResponse> {
    return this.api.request('DELETE', `/api/users/me${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async getProxyMe(req: GetUsersMeWildcardRequest): Promise<GetUsersMeWildcardResponse> {
    return this.api.request('GET', `/api/users/me${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async patchProxyMe(req: PatchUsersMeWildcardRequest): Promise<PatchUsersMeWildcardResponse> {
    return this.api.request('PATCH', `/api/users/me${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async postProxyMe(req: PostUsersMeWildcardRequest): Promise<PostUsersMeWildcardResponse> {
    return this.api.request('POST', `/api/users/me${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async putProxyMe(req: PutUsersMeWildcardRequest): Promise<PutUsersMeWildcardResponse> {
    return this.api.request('PUT', `/api/users/me${req.rest ? '/' + req.rest : ''}`, { query: undefined, body: undefined });
  }

  async meEnv(req: GetUsersMeEnvRequest): Promise<GetUsersMeEnvResponse> {
    return this.api.request('GET', `/api/users/me/env`, { query: undefined, body: undefined });
  }

  async updateMeEnv(req: PatchUsersMeEnvRequest): Promise<PatchUsersMeEnvResponse> {
    return this.api.request('PATCH', `/api/users/me/env`, { query: undefined, body: undefined });
  }

  async meHub(req: GetUsersMeHubRequest): Promise<GetUsersMeHubResponse> {
    return this.api.request('GET', `/api/users/me/hub`, { query: undefined, body: undefined });
  }

  async deleteKv(req: DeleteUsersMeKvRequest): Promise<DeleteUsersMeKvResponse> {
    const query = {
      key: req.key,
    };
    return this.api.request('DELETE', `/api/users/me/kv`, { query: query, body: undefined });
  }

  async meKv(req: GetUsersMeKvRequest): Promise<GetUsersMeKvResponse> {
    const query = {
      key: req.key,
      limit: req.limit,
      offset: req.offset,
      prefix: req.prefix,
    };
    return this.api.request('GET', `/api/users/me/kv`, { query: query, body: undefined });
  }

  async setMeKv(req: PostUsersMeKvRequest): Promise<PostUsersMeKvResponse> {
    return this.api.request('POST', `/api/users/me/kv`, { query: undefined, body: undefined });
  }

  async meStream(req: GetUsersMeStreamRequest): Promise<GetUsersMeStreamResponse> {
    return this.api.request('GET', `/api/users/me/stream`, { query: undefined, body: undefined });
  }

}

class VariablesNamespace {
  constructor(private api: AgentBuilderApi) {}

  async getAgents(req: GetVariablesAgentsByNameRequest): Promise<GetVariablesAgentsByNameResponse> {
    const query = {
      thread_id: req.thread_id,
    };
    return this.api.request('GET', `/api/variables/agents/${req.name}`, { query: query, body: undefined });
  }

  async getPrompts(req: GetVariablesPromptsByNameRequest): Promise<GetVariablesPromptsByNameResponse> {
    const query = {
      thread_id: req.thread_id,
    };
    return this.api.request('GET', `/api/variables/prompts/${req.name}`, { query: query, body: undefined });
  }

  async getTools(req: GetVariablesToolsByNameRequest): Promise<GetVariablesToolsByNameResponse> {
    const query = {
      thread_id: req.thread_id,
    };
    return this.api.request('GET', `/api/variables/tools/${req.name}`, { query: query, body: undefined });
  }

}
