import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ServersView } from './components/ServersView';
import { ProvidersView } from './components/ProvidersView';
import { ToolsInspectorView } from './components/ToolsInspectorView';
import { PlaygroundView } from './components/PlaygroundView';
import { CustomServerModal } from './components/CustomServerModal';
import { ConfigExportModal } from './components/ConfigExportModal';
import { DEFAULT_SERVERS } from './data/defaultServers';
import { DEFAULT_PROVIDERS } from './data/defaultProviders';
import { MCPServerConfig, ProviderConfig, ProviderId } from './types/mcp';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mcp_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('mcp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('mcp_theme', 'light');
    }
  }, [isDark]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'servers' | 'providers' | 'tools' | 'playground'>('servers');

  // Tool inspect targeting state
  const [targetToolInspect, setTargetToolInspect] = useState<{ toolName?: string; serverId?: string }>({});

  // Servers state with local persistence
  const [servers, setServers] = useState<MCPServerConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mcp_installed_servers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_SERVERS;
  });

  useEffect(() => {
    localStorage.setItem('mcp_installed_servers', JSON.stringify(servers));
  }, [servers]);

  // Providers state with local persistence
  const [providers, setProviders] = useState<ProviderConfig[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('mcp_model_providers');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // fallback
        }
      }
    }
    return DEFAULT_PROVIDERS;
  });

  useEffect(() => {
    localStorage.setItem('mcp_model_providers', JSON.stringify(providers));
  }, [providers]);

  // Active Model Provider
  const [activeProviderId, setActiveProviderId] = useState<ProviderId>('gemini');
  const [activeModelId, setActiveModelId] = useState<string>('gemini-3.8-flash');

  // Modals state
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [serverToEdit, setServerToEdit] = useState<MCPServerConfig | null>(null);

  // Check server health and Gemini auto-detection on mount
  useEffect(() => {
    fetch('/api/status')
      .then((res) => res.json())
      .then((data) => {
        if (data.geminiKeyDetected) {
          setProviders((prev) =>
            prev.map((p) =>
              p.id === 'gemini' ? { ...p, status: 'auto_detected', isLoggedIn: true } : p
            )
          );
        }
      })
      .catch(() => {});
  }, []);

  // Handlers for servers
  const handleToggleEnabled = (id: string) => {
    setServers((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleToggleInstall = (id: string) => {
    setServers((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const nextInstall = !s.isInstalled;
          return {
            ...s,
            isInstalled: nextInstall,
            isEnabled: nextInstall,
            status: nextInstall ? 'connected' : 'idle',
          };
        }
        return s;
      })
    );
  };

  const handleConfigureServer = (server: MCPServerConfig) => {
    setServerToEdit(server);
    setIsCustomModalOpen(true);
  };

  const handleSaveCustomServer = (newServer: MCPServerConfig) => {
    setServers((prev) => {
      const exists = prev.some((s) => s.id === newServer.id);
      if (exists) {
        return prev.map((s) => (s.id === newServer.id ? newServer : s));
      }
      return [newServer, ...prev];
    });
    setServerToEdit(null);
  };

  const handleImportServers = (imported: MCPServerConfig[]) => {
    setServers((prev) => [...imported, ...prev]);
  };

  const handleSelectToolForInspect = (toolName: string, serverId: string) => {
    setTargetToolInspect({ toolName, serverId });
    setActiveTab('tools');
  };

  // Provider update handler
  const handleUpdateProvider = (providerId: ProviderId, updates: Partial<ProviderConfig>) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, ...updates } : p))
    );
    if (providerId === activeProviderId && updates.selectedModel) {
      setActiveModelId(updates.selectedModel);
    }
  };

  const handleSelectActiveProvider = (providerId: ProviderId, modelId: string) => {
    setActiveProviderId(providerId);
    setActiveModelId(modelId);
    handleUpdateProvider(providerId, { selectedModel: modelId });
  };

  const activeProvider = providers.find((p) => p.id === activeProviderId) || providers[0];
  const activeServersCount = servers.filter((s) => s.isInstalled && s.isEnabled).length;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        onOpenCustomModal={() => {
          setServerToEdit(null);
          setIsCustomModalOpen(true);
        }}
        onOpenConfigModal={() => setIsConfigModalOpen(true)}
        activeProviderName={activeProvider.name}
        activeModelName={activeModelId}
        activeServersCount={activeServersCount}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'servers' && (
          <ServersView
            servers={servers}
            onToggleEnabled={handleToggleEnabled}
            onToggleInstall={handleToggleInstall}
            onConfigureServer={handleConfigureServer}
            onOpenCustomModal={() => {
              setServerToEdit(null);
              setIsCustomModalOpen(true);
            }}
            onOpenConfigModal={() => setIsConfigModalOpen(true)}
            onSelectToolForInspect={handleSelectToolForInspect}
          />
        )}

        {activeTab === 'providers' && (
          <ProvidersView
            providers={providers}
            activeProviderId={activeProviderId}
            activeModelId={activeModelId}
            onSelectActiveProvider={handleSelectActiveProvider}
            onUpdateProvider={handleUpdateProvider}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsInspectorView
            servers={servers}
            initialSelectedToolName={targetToolInspect.toolName}
            initialSelectedServerId={targetToolInspect.serverId}
          />
        )}

        {activeTab === 'playground' && (
          <PlaygroundView
            servers={servers}
            providers={providers}
            activeProviderId={activeProviderId}
            activeModelId={activeModelId}
            onSelectActiveProvider={handleSelectActiveProvider}
            onToggleServer={handleToggleEnabled}
          />
        )}
      </main>

      {/* Modals */}
      <CustomServerModal
        isOpen={isCustomModalOpen}
        onClose={() => {
          setIsCustomModalOpen(false);
          setServerToEdit(null);
        }}
        onSave={handleSaveCustomServer}
        initialServer={serverToEdit}
      />

      <ConfigExportModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        servers={servers}
        onImportServers={handleImportServers}
      />
    </div>
  );
}
