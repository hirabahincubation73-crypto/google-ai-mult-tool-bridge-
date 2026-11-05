import React, { useState } from 'react';
import {
  FolderTree,
  Github,
  Globe,
  Database,
  BrainCircuit,
  Compass,
  Server,
  MessageSquare,
  Box,
  Search,
  Check,
  Power,
  Settings2,
  Terminal,
  Activity,
  ChevronDown,
  ChevronUp,
  Trash2,
  PlusCircle,
  ExternalLink,
} from 'lucide-react';
import { MCPServerConfig } from '../types/mcp';

interface ServersViewProps {
  servers: MCPServerConfig[];
  onToggleEnabled: (id: string) => void;
  onToggleInstall: (id: string) => void;
  onConfigureServer: (server: MCPServerConfig) => void;
  onOpenCustomModal: () => void;
  onOpenConfigModal: () => void;
  onSelectToolForInspect: (toolName: string, serverId: string) => void;
}

export const ServersView: React.FC<ServersViewProps> = ({
  servers,
  onToggleEnabled,
  onToggleInstall,
  onConfigureServer,
  onOpenCustomModal,
  onOpenConfigModal,
  onSelectToolForInspect,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedToolsServerId, setExpandedToolsServerId] = useState<string | null>(null);
  const [pingingId, setPingingId] = useState<string | null>(null);

  const getIcon = (name: string) => {
    switch (name) {
      case 'FolderTree': return <FolderTree className="w-5 h-5" />;
      case 'Github': return <Github className="w-5 h-5" />;
      case 'Globe': return <Globe className="w-5 h-5" />;
      case 'Database': return <Database className="w-5 h-5" />;
      case 'BrainCircuit': return <BrainCircuit className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'Server': return <Server className="w-5 h-5" />;
      case 'MessageSquare': return <MessageSquare className="w-5 h-5" />;
      default: return <Box className="w-5 h-5" />;
    }
  };

  const installedCount = servers.filter((s) => s.isInstalled).length;
  const activeCount = servers.filter((s) => s.isEnabled && s.isInstalled).length;
  const totalToolsCount = servers.reduce((acc, s) => acc + (s.isInstalled ? s.tools.length : 0), 0);

  const filteredServers = servers.filter((server) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'installed'
        ? server.isInstalled
        : server.category === selectedCategory;

    const matchesSearch =
      server.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      server.tools.some((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (server.command && server.command.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesSearch;
  });

  const handlePing = async (serverId: string) => {
    setPingingId(serverId);
    try {
      await new Promise((r) => setTimeout(r, 350));
      // Handled in state
    } finally {
      setPingingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Installed Servers</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
              {installedCount}
            </span>
            <span className="text-xs text-neutral-400">/ {servers.length} available</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Active in Chat</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
              {activeCount}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">ready to call</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Registered Tools</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-neutral-900 dark:text-neutral-100 tabular-nums">
              {totalToolsCount}
            </span>
            <span className="text-xs text-neutral-400">functions</span>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Protocol Spec</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-base font-semibold font-mono text-neutral-900 dark:text-neutral-100">
              2024-11-05
            </span>
            <span className="text-xs text-neutral-400 font-mono">JSON-RPC</span>
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All Servers' },
            { id: 'installed', label: 'Installed' },
            { id: 'filesystem', label: 'Filesystem' },
            { id: 'developer', label: 'Developer' },
            { id: 'database', label: 'Database' },
            { id: 'web', label: 'Web & Search' },
            { id: 'productivity', label: 'Productivity' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search servers, tools, commands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* Server Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServers.map((server) => {
          const isExpanded = expandedToolsServerId === server.id;
          const isPinging = pingingId === server.id;

          return (
            <div
              key={server.id}
              className={`flex flex-col justify-between p-5 rounded-xl border bg-white dark:bg-neutral-900 transition-all ${
                server.isEnabled && server.isInstalled
                  ? 'border-neutral-400 dark:border-neutral-600 shadow-xs'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div>
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-neutral-200 shrink-0">
                      {getIcon(server.iconName)}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                        {server.name}
                      </h3>
                      {/* Unboxed metadata per constitution */}
                      <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        <span className="capitalize">{server.category}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px]">{server.transport}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px]">v{server.version}</span>
                      </div>
                    </div>
                  </div>

                  {/* Install / Enable toggle */}
                  <div className="flex items-center gap-2 shrink-0">
                    {server.isInstalled ? (
                      <label className="relative inline-flex items-center cursor-pointer" title="Toggle active in chat">
                        <input
                          type="checkbox"
                          checked={server.isEnabled}
                          onChange={() => onToggleEnabled(server.id)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-hidden rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-neutral-900 dark:peer-checked:bg-neutral-100"></div>
                      </label>
                    ) : (
                      <button
                        onClick={() => onToggleInstall(server.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-lg transition-colors whitespace-nowrap"
                      >
                        Install
                      </button>
                    )}
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-3 line-clamp-2">
                  {server.description}
                </p>

                {/* Command or URL snippet */}
                <div className="mt-3 p-2 bg-neutral-50 dark:bg-neutral-950 rounded-lg border border-neutral-100 dark:border-neutral-800/60 font-mono text-[11px] text-neutral-600 dark:text-neutral-300 flex items-center justify-between">
                  <span className="truncate pr-2">
                    {server.transport === 'stdio'
                      ? `${server.command} ${server.args?.join(' ') || ''}`
                      : server.url}
                  </span>
                  <button
                    onClick={() => handlePing(server.id)}
                    title="Test ping latency"
                    disabled={isPinging}
                    className="shrink-0 text-xs font-sans text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 flex items-center gap-1"
                  >
                    <Activity className={`w-3 h-3 ${isPinging ? 'animate-spin' : ''}`} />
                    <span className="tabular-nums font-mono text-[10px]">
                      {server.latencyMs || 15}ms
                    </span>
                  </button>
                </div>

                {/* Tools Drawer Toggle */}
                <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedToolsServerId(isExpanded ? null : server.id)}
                      className="text-xs text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200 flex items-center gap-1"
                    >
                      <span>{server.tools.length} Tools Exposed</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-xs text-neutral-400">
                      Maintainer: {server.author}
                    </span>
                  </div>

                  {/* Expanded Tools list */}
                  {isExpanded && (
                    <div className="mt-2 space-y-1.5 pt-1">
                      {server.tools.map((tool) => (
                        <div
                          key={tool.name}
                          onClick={() => onSelectToolForInspect(tool.name, server.id)}
                          className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-950 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 border border-neutral-100 dark:border-neutral-800 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-medium text-neutral-800 dark:text-neutral-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {tool.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 flex items-center gap-1">
                              Inspect <ExternalLink className="w-2.5 h-2.5" />
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-1">
                            {tool.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Footer */}
              {server.isInstalled && (
                <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800/60">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        server.isEnabled ? 'bg-emerald-500' : 'bg-neutral-400'
                      }`}
                    />
                    <span className="text-neutral-600 dark:text-neutral-400">
                      {server.isEnabled ? 'Active in Chat' : 'Installed (Standby)'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onConfigureServer(server)}
                      className="px-2.5 py-1 text-xs text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 transition-colors flex items-center gap-1"
                    >
                      <Settings2 className="w-3 h-3" />
                      <span>Config</span>
                    </button>
                    <button
                      onClick={() => onToggleInstall(server.id)}
                      title="Uninstall plugin"
                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredServers.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <Box className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">No servers found</h3>
          <p className="text-xs text-neutral-500 mt-1">Try adjusting your category filter or search query.</p>
        </div>
      )}
    </div>
  );
};
