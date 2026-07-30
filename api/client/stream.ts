// WebSocket helpers for the 7 streaming endpoints
/* eslint-disable */
import { PlatformApi } from './client';

export interface StreamOptions {
  onOpen?: () => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
}

function wsUrl(baseUrl: string, path: string): string {
  const url = new URL(path, baseUrl);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  return url.toString();
}

function openStream(
  baseUrl: string,
  token: string | undefined,
  path: string,
  onMessage: (data: unknown) => void,
  options: StreamOptions = {},
): WebSocket {
  const ws = new WebSocket(wsUrl(baseUrl, path));
  ws.onopen = () => {
    if (token) ws.send(JSON.stringify({ type: 'auth', token }));
    if (options.onOpen) options.onOpen();
  };
  ws.onmessage = (event) => {
    let payload: unknown = event.data;
    try {
      payload = JSON.parse(event.data);
    } catch {
      // leave as raw string
    }
    onMessage(payload);
  };
  ws.onclose = (event) => { if (options.onClose) options.onClose(event); };
  ws.onerror = (event) => { if (options.onError) options.onError(event); };
  return ws;
}

export function createStreamClient(api: PlatformApi) {
  return {
    events: (onMessage: (data: unknown) => void, options?: StreamOptions) =>
      openStream(api.baseUrl, api.token, '/api/events', onMessage, options),
    thread: (threadId: string, onMessage: (data: unknown) => void, options?: StreamOptions) =>
      openStream(api.baseUrl, api.token, `/api/threads/${threadId}/stream`, onMessage, options),
    bridge: (threadId: string, onMessage: (data: unknown) => void, options?: StreamOptions) =>
      openStream(api.baseUrl, api.token, `/api/threads/${threadId}/bridge`, onMessage, options),
    userMe: (onMessage: (data: unknown) => void, options?: StreamOptions) =>
      openStream(api.baseUrl, api.token, '/api/users/me/stream', onMessage, options),
    user: (userId: string, onMessage: (data: unknown) => void, options?: StreamOptions) =>
      openStream(api.baseUrl, api.token, `/api/users/${userId}/stream`, onMessage, options),
    userMeHub: (onMessage: (data: unknown) => void, options?: StreamOptions) =>
      openStream(api.baseUrl, api.token, '/api/users/me/hub', onMessage, options),
    threadLogs: (threadId: string, onMessage: (data: unknown) => void, options?: StreamOptions) =>
      openStream(api.baseUrl, api.token, `/api/threads/${threadId}/logs`, onMessage, options),
  };
}
