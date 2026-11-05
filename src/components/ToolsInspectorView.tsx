import React, { useState } from 'react';
import {
  Wrench,
  Play,
  Copy,
  Check,
  Search,
  Code2,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { MCPServerConfig, MCPToolSchema } from '../types/mcp';

interface ToolsInspectorViewProps {
  servers: MCPServerConfig[];
  initialSelectedToolName?: string;
  initialSelectedServerId?: string;
}

export const ToolsInspectorView: React.FC<ToolsInspectorViewProps> = ({
  servers,
  initialSelectedToolName,
  initialSelectedServerId,
}) => {
  // Aggregate tools from all installed servers
  const allTools: { tool: MCPToolSchema; server: MCPServerConfig }[] = [];
  servers.forEach((s) => {
    if (s.isInstalled) {
      s.tools.forEach((t) => {
        allTools.push({ tool: t, server: s });
      });
    }
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedServerFilter, setSelectedServerFilter] = useState<string>('all');

  // Find initial tool or default to first
  const initialMatch = allTools.find(
    (item) =>
      (!initialSelectedToolName || item.tool.name === initialSelectedToolName) &&
      (!initialSelectedServerId || item.server.id === initialSelectedServerId)
  ) || allTools[0];

  const [activeToolItem, setActiveToolItem] = useState<{ tool: MCPToolSchema; server: MCPServerConfig } | null>(
    initialMatch || null
  );

  // Form values state for the active tool
  const [paramValues, setParamValues] = useState<Record<string, any>>({
    path: '.',
    query: 'mcp servers language:typescript',
    url: 'https://modelcontextprotocol.io',
    pattern: '*.tsx',
    content: '// Sample file content',
  });

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionResult, setExecutionResult] = useState<any>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const filteredTools = allTools.filter(({ tool, server }) => {
    const matchesServer = selectedServerFilter === 'all' || server.id === selectedServerFilter;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesServer && matchesSearch;
  });

  const handleSelectTool = (item: { tool: MCPToolSchema; server: MCPServerConfig }) => {
    setActiveToolItem(item);
    setExecutionResult(null);

    // Provide sensible default inputs based on tool name
    if (item.tool.name === 'read_file') {
      setParamValues((prev) => ({ ...prev, path: 'package.json' }));
    } else if (item.tool.name === 'list_directory') {
      setParamValues((prev) => ({ ...prev, path: '.' }));
    } else if (item.tool.name === 'search_repositories') {
      setParamValues((prev) => ({ ...prev, query: 'mcp servers' }));
    } else if (item.tool.name === 'read_query') {
      setParamValues((prev) => ({ ...prev, query: 'SELECT * FROM servers;' }));
    } else if (item.tool.name === 'fetch_url') {
      setParamValues((prev) => ({ ...prev, url: 'https://modelcontextprotocol.io' }));
    } else if (item.tool.name === 'search_nodes') {
      setParamValues((prev) => ({ ...prev, query: 'gemini' }));
    }
  };

  const handleRunTool = async () => {
    if (!activeToolItem) return;
    setIsRunning(true);
    setExecutionResult(null);

    try {
      const res = await fetch('/api/mcp/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolName: activeToolItem.tool.name,
          args: paramValues,
          serverId: activeToolItem.server.id,
        }),
      });
      const data = await res.json();
      setExecutionResult(data);
    } catch (err: any) {
      setExecutionResult({
        success: false,
        error: err.message,
        durationMs: 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleCopyResult = () => {
    if (!executionResult) return;
    navigator.clipboard.writeText(JSON.stringify(executionResult, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-blue-500" />
            <span>Interactive Tool Inspector & Runner</span>
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Directly test any function schema exposed by your installed MCP plugins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Server filter */}
          <select
            value={selectedServerFilter}
            onChange={(e) => setSelectedServerFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-800 dark:text-neutral-200"
          >
            <option value="all">All Servers ({allTools.length} tools)</option>
            {servers.filter((s) => s.isInstalled).map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.tools.length})
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Two Column Layout: Tool list on left, Execution sandbox on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tools List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-2 space-y-1 max-h-[640px] overflow-y-auto">
          {filteredTools.map((item) => {
            const isSelected = activeToolItem?.tool.name === item.tool.name && activeToolItem?.server.id === item.server.id;
            return (
              <button
                key={`${item.server.id}_${item.tool.name}`}
                onClick={() => handleSelectTool(item)}
                className={`w-full text-left p-3 rounded-lg transition-colors flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold">
                    {item.tool.name}
                  </span>
                  <span
                    className={`text-[10px] font-sans px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-neutral-800 text-neutral-200 dark:bg-neutral-200 dark:text-neutral-800'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                    }`}
                  >
                    {item.server.name.replace(' Server', '')}
                  </span>
                </div>
                <p
                  className={`text-[11px] line-clamp-1 ${
                    isSelected ? 'text-neutral-300 dark:text-neutral-700' : 'text-neutral-500 dark:text-neutral-400'
                  }`}
                >
                  {item.tool.description}
                </p>
              </button>
            );
          })}

          {filteredTools.length === 0 && (
            <div className="text-center py-8 text-neutral-400 text-xs">
              No matching tools found.
            </div>
          )}
        </div>

        {/* Right: Interactive Parameter & Sandbox Form (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 space-y-5">
          {activeToolItem ? (
            <>
              {/* Tool Header */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-neutral-900 dark:text-neutral-100">
                      {activeToolItem.tool.name}
                    </span>
                    <span className="text-xs text-neutral-500 font-sans">
                      from {activeToolItem.server.name}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                    {activeToolItem.tool.description}
                  </p>
                </div>

                <button
                  onClick={handleRunTool}
                  disabled={isRunning}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-lg transition-colors shadow-xs whitespace-nowrap shrink-0"
                >
                  <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Running...' : 'Execute Tool'}</span>
                </button>
              </div>

              {/* Dynamic Parameter Inputs Form */}
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Input Arguments (JSON Schema)</span>
                </h4>

                {activeToolItem.tool.inputSchema.properties &&
                Object.keys(activeToolItem.tool.inputSchema.properties).length > 0 ? (
                  <div className="space-y-3">
                    {Object.entries(activeToolItem.tool.inputSchema.properties).map(([key, prop]) => {
                      const isRequired = activeToolItem.tool.inputSchema.required?.includes(key);
                      return (
                        <div key={key} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-mono font-medium text-neutral-800 dark:text-neutral-200">
                              {key} {isRequired && <span className="text-red-500">*</span>}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-400">
                              {prop.type}
                            </span>
                          </div>
                          {prop.description && (
                            <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                              {prop.description}
                            </p>
                          )}

                          {prop.enum ? (
                            <select
                              value={paramValues[key] || prop.enum[0]}
                              onChange={(e) => setParamValues({ ...paramValues, [key]: e.target.value })}
                              className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100"
                            >
                              {prop.enum.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={paramValues[key] ?? ''}
                              onChange={(e) => setParamValues({ ...paramValues, [key]: e.target.value })}
                              placeholder={`Enter ${key}...`}
                              className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 italic">
                    This tool takes no arguments. Ready to execute immediately.
                  </p>
                )}
              </div>

              {/* Execution Output Panel */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Tool Output Response</span>
                  </h4>

                  {executionResult && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 tabular-nums">
                        {executionResult.durationMs}ms
                      </span>
                      <button
                        onClick={handleCopyResult}
                        className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-neutral-900 dark:bg-neutral-950 text-neutral-100 rounded-xl font-mono text-xs overflow-x-auto min-h-[160px] border border-neutral-800">
                  {isRunning ? (
                    <div className="flex items-center justify-center h-32 text-neutral-400">
                      <Sparkles className="w-4 h-4 animate-spin mr-2" />
                      Executing via MCP runtime...
                    </div>
                  ) : executionResult ? (
                    <pre>{JSON.stringify(executionResult, null, 2)}</pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-32 text-neutral-500 text-xs">
                      <span>Click "Execute Tool" to test this tool schema</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-neutral-400 text-xs">
              Select a tool on the left to inspect its schema and execute.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
