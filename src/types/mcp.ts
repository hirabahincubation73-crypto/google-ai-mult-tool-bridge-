export type TransportType = 'stdio' | 'sse' | 'websocket';

export interface MCPToolParamProperty {
  type: string;
  description?: string;
  enum?: string[];
  default?: any;
  items?: {
    type: string;
  };
}

export interface MCPToolSchema {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPToolParamProperty>;
    required?: string[];
  };
  serverName?: string;
  serverId?: string;
}

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPServerConfig {
  id: string;
  name: string;
  description: string;
  category: 'filesystem' | 'database' | 'developer' | 'web' | 'productivity' | 'custom';
  author: string;
  transport: TransportType;
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  url?: string; // For SSE or HTTP
  iconName: string;
  version: string;
  isInstalled: boolean;
  isEnabled: boolean; // active in playground
  status: 'connected' | 'idle' | 'stopped' | 'error';
  latencyMs?: number;
  lastPing?: string;
  tools: MCPToolSchema[];
  resources?: MCPResource[];
  isCustom?: boolean;
}

export type ProviderId = 'gemini' | 'openai' | 'anthropic' | 'ollama' | 'openrouter' | 'groq' | 'mistral';

export interface ModelOption {
  id: string;
  name: string;
  contextWindow: string;
  description: string;
  recommended?: boolean;
}

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  iconName: string;
  description: string;
  authType: 'api_key' | 'base_url' | 'none';
  apiKey?: string;
  baseUrl?: string;
  organizationId?: string;
  isLoggedIn: boolean;
  status: 'ready' | 'invalid' | 'untested' | 'auto_detected';
  selectedModel: string;
  availableModels: ModelOption[];
  lastTested?: string;
  keyHint?: string;
  docUrl: string;
}

export interface ToolInvocationLog {
  id: string;
  toolName: string;
  serverName: string;
  arguments: Record<string, any>;
  result: any;
  durationMs: number;
  timestamp: string;
  status: 'success' | 'error';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  modelUsed?: string;
  providerId?: ProviderId;
  timestamp: string;
  toolCalls?: ToolInvocationLog[];
  isStreaming?: boolean;
}
