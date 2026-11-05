import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Wrench,
  ChevronDown,
  ChevronUp,
  Settings,
  Trash2,
  Layers,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { ChatMessage, MCPServerConfig, ProviderConfig, ProviderId, ToolInvocationLog } from '../types/mcp';

interface PlaygroundViewProps {
  servers: MCPServerConfig[];
  providers: ProviderConfig[];
  activeProviderId: ProviderId;
  activeModelId: string;
  onSelectActiveProvider: (providerId: ProviderId, modelId: string) => void;
  onToggleServer: (serverId: string) => void;
}

export const PlaygroundView: React.FC<PlaygroundViewProps> = ({
  servers,
  providers,
  activeProviderId,
  activeModelId,
  onSelectActiveProvider,
  onToggleServer,
}) => {
  const activeProvider = providers.find((p) => p.id === activeProviderId) || providers[0];
  const activeServers = servers.filter((s) => s.isInstalled && s.isEnabled);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Welcome to **MCP Studio Playground**!\n\nI am connected to **${activeModelId}** with **${activeServers.length} active MCP servers** enabled.\n\nYou can ask me to inspect your project files, search GitHub repositories, query databases, or store persistent knowledge. Try one of the quick prompts below or type your own request.`,
      timestamp: 'Just now',
      modelUsed: activeModelId,
      providerId: activeProviderId,
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [systemInstruction, setSystemInstruction] = useState<string>(
    'You are an intelligent, helpful developer assistant empowered by Model Context Protocol (MCP) tools. Prioritize using MCP tools whenever external or local context is needed.'
  );
  const [expandedToolCallIds, setExpandedToolCallIds] = useState<Record<string, boolean>>({});
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputPrompt('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: prompt,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          providerId: activeProviderId,
          modelId: activeModelId,
          activeServers,
          systemInstruction,
          userApiKey: activeProvider.apiKey,
        }),
      });

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response returned from model.',
        modelUsed: data.modelUsed || activeModelId,
        providerId: data.providerId || activeProviderId,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCalls: data.toolCalls,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error_${Date.now()}`,
          role: 'assistant',
          content: `Connection error: ${err.message}. Please check model credentials in Model Login Gateway.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleToolCallExpand = (id: string) => {
    setExpandedToolCallIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'new_chat',
        role: 'assistant',
        content: `Chat history reset. Ready for queries with **${activeModelId}** and **${activeServers.length} active MCP servers**.`,
        timestamp: 'Just now',
        modelUsed: activeModelId,
        providerId: activeProviderId,
      },
    ]);
  };

  const quickPrompts = [
    { label: 'List project files', prompt: 'List all files and folders in the current project root using filesystem MCP.' },
    { label: 'Search GitHub MCP repos', prompt: 'Search GitHub for popular TypeScript repositories related to Model Context Protocol.' },
    { label: 'Query SQLite database', prompt: 'Run a query on the SQLite database to describe tables and inspect server records.' },
    { label: 'Inspect Knowledge Graph', prompt: 'Inspect all entities and relations in the persistent Memory graph.' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-xs">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/80">
        <div className="flex items-center gap-3">
          {/* Active Model Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-500">Model:</span>
            <select
              value={`${activeProviderId}:${activeModelId}`}
              onChange={(e) => {
                const [pId, mId] = e.target.value.split(':');
                onSelectActiveProvider(pId as ProviderId, mId);
              }}
              className="text-xs font-mono font-medium bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-md px-2 py-1 text-neutral-900 dark:text-neutral-100"
            >
              {providers.map((p) =>
                p.availableModels.map((m) => (
                  <option key={`${p.id}:${m.id}`} value={`${p.id}:${m.id}`}>
                    {p.name} — {m.name}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Active MCP Plugins Quick Toggle Strip */}
          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-neutral-200 dark:border-neutral-800 text-xs">
            <span className="text-neutral-500">MCP Plugins:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {servers.filter((s) => s.isInstalled).map((s) => (
                <button
                  key={s.id}
                  onClick={() => onToggleServer(s.id)}
                  title={`${s.name} (${s.isEnabled ? 'Active' : 'Disabled'})`}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    s.isEnabled
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium'
                      : 'bg-neutral-200/80 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200'
                  }`}
                >
                  {s.name.replace(' Server', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
            title="System prompt settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={handleClearChat}
            className="p-1.5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white rounded-md hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
            title="Clear chat"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* System Instructions Drawer */}
      {showSettingsDrawer && (
        <div className="p-3 bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-700 dark:text-neutral-300">
              System Instructions
            </span>
            <span className="text-[11px] text-neutral-500">Applied to model requests</span>
          </div>
          <textarea
            value={systemInstruction}
            onChange={(e) => setSystemInstruction(e.target.value)}
            rows={2}
            className="w-full p-2 text-xs font-mono bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100"
          />
        </div>
      )}

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold shadow-2xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                {/* Message Header info */}
                <div
                  className={`flex items-center gap-2 text-[11px] text-neutral-400 font-mono ${
                    isUser ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{isUser ? 'You' : msg.modelUsed || 'Assistant'}</span>
                  <span aria-hidden="true">·</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Inline Tool Calls (if assistant invoked any MCP tools) */}
                {msg.toolCalls && msg.toolCalls.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {msg.toolCalls.map((tc) => {
                      const isExpanded = expandedToolCallIds[tc.id];
                      return (
                        <div
                          key={tc.id}
                          className="rounded-lg border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/90 text-xs overflow-hidden"
                        >
                          <div
                            onClick={() => toggleToolCallExpand(tc.id)}
                            className="flex items-center justify-between p-2.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Wrench className="w-3.5 h-3.5 text-blue-500" />
                              <span className="font-mono font-semibold text-neutral-900 dark:text-neutral-100">
                                {tc.toolName}
                              </span>
                              <span className="text-[11px] text-neutral-500 font-sans">
                                via {tc.serverName}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[10px] text-neutral-400 tabular-nums">
                                {tc.durationMs}ms
                              </span>
                              {tc.status === 'success' ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                              ) : (
                                <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                              )}
                              {isExpanded ? (
                                <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
                              )}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2 font-mono text-[11px]">
                              <div>
                                <span className="text-neutral-500 block mb-0.5">Arguments:</span>
                                <pre className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto text-neutral-800 dark:text-neutral-200">
                                  {JSON.stringify(tc.arguments, null, 2)}
                                </pre>
                              </div>
                              <div>
                                <span className="text-neutral-500 block mb-0.5">Result Payload:</span>
                                <pre className="p-2 rounded bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 overflow-x-auto text-neutral-800 dark:text-neutral-200 max-h-48">
                                  {JSON.stringify(tc.result, null, 2)}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3.5 rounded-xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    isUser
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 font-medium'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 border border-neutral-200/60 dark:border-neutral-700/60'
                  }`}
                >
                  {msg.content}
                </div>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-neutral-200 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 flex items-center justify-center shrink-0 mt-0.5 text-xs font-semibold">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Spinner */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 flex items-center justify-center shrink-0 mt-0.5 text-xs">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-xl text-xs text-neutral-500 flex items-center gap-2">
              <span>Model orchestrating MCP servers...</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="px-4 py-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/40 flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] text-neutral-400 whitespace-nowrap">Try MCP:</span>
        {quickPrompts.map((qp) => (
          <button
            key={qp.label}
            onClick={() => handleSendMessage(qp.prompt)}
            className="px-2.5 py-1 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 rounded-full text-neutral-700 dark:text-neutral-300 whitespace-nowrap transition-colors"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-end gap-2 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl p-2 focus-within:ring-1 focus-within:ring-neutral-400 dark:focus-within:ring-neutral-600">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${activeModelId} with ${activeServers.length} MCP tools... (Shift+Enter for newline)`}
            rows={2}
            className="flex-1 bg-transparent border-0 resize-none text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-hidden"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputPrompt.trim() || isLoading}
            className="p-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
