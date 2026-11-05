import React, { useState } from 'react';
import {
  Sparkles,
  Cpu,
  Layers,
  Terminal,
  Network,
  Zap,
  Boxes,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Radio,
  RefreshCw,
} from 'lucide-react';
import { ProviderConfig, ProviderId } from '../types/mcp';

interface ProvidersViewProps {
  providers: ProviderConfig[];
  activeProviderId: ProviderId;
  activeModelId: string;
  onSelectActiveProvider: (providerId: ProviderId, modelId: string) => void;
  onUpdateProvider: (providerId: ProviderId, updates: Partial<ProviderConfig>) => void;
}

export const ProvidersView: React.FC<ProvidersViewProps> = ({
  providers,
  activeProviderId,
  activeModelId,
  onSelectActiveProvider,
  onUpdateProvider,
}) => {
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState<Record<string, { success: boolean; text: string }>>({});

  const getProviderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-indigo-500" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-emerald-500" />;
      case 'Layers': return <Layers className="w-5 h-5 text-amber-500" />;
      case 'Terminal': return <Terminal className="w-5 h-5 text-sky-500" />;
      case 'Network': return <Network className="w-5 h-5 text-purple-500" />;
      case 'Zap': return <Zap className="w-5 h-5 text-amber-400" />;
      case 'Boxes': return <Boxes className="w-5 h-5 text-orange-500" />;
      default: return <Cpu className="w-5 h-5" />;
    }
  };

  const toggleShowKey = (id: string) => {
    setShowKeys((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleVerify = async (provider: ProviderConfig) => {
    setVerifyingId(provider.id);
    setVerifyMessage((prev) => ({ ...prev, [provider.id]: { success: false, text: 'Testing connection...' } }));

    try {
      const res = await fetch('/api/providers/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: provider.id,
          apiKey: provider.apiKey,
          baseUrl: provider.baseUrl,
        }),
      });
      const data = await res.json();

      if (data.verified) {
        onUpdateProvider(provider.id, {
          isLoggedIn: true,
          status: 'ready',
          lastTested: new Date().toLocaleTimeString(),
        });
        setVerifyMessage((prev) => ({
          ...prev,
          [provider.id]: {
            success: true,
            text: `Verified in ${data.latencyMs}ms: ${data.message}`,
          },
        }));
      } else {
        setVerifyMessage((prev) => ({
          ...prev,
          [provider.id]: {
            success: false,
            text: data.error || 'Verification failed. Please check credentials.',
          },
        }));
      }
    } catch (err: any) {
      setVerifyMessage((prev) => ({
        ...prev,
        [provider.id]: {
          success: false,
          text: `Verification error: ${err.message}`,
        },
      }));
    } finally {
      setVerifyingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="bg-white dark:bg-neutral-900 p-5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <span>Multi-Model Login Gateway</span>
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 max-w-2xl">
            Authenticate with frontier and open-source models. Once connected, your active model can call all installed MCP plugins seamlessly in the Playground.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/60 px-3 py-1.5 rounded-lg border border-neutral-100 dark:border-neutral-800">
          <span>Active:</span>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {activeModelId}
          </span>
        </div>
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {providers.map((provider) => {
          const isActive = activeProviderId === provider.id;
          const isVerifying = verifyingId === provider.id;
          const statusMsg = verifyMessage[provider.id];

          return (
            <div
              key={provider.id}
              className={`p-5 rounded-xl border bg-white dark:bg-neutral-900 flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-neutral-900 dark:border-neutral-100 ring-1 ring-neutral-900 dark:ring-neutral-100 shadow-sm'
                  : 'border-neutral-200 dark:border-neutral-800'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      {getProviderIcon(provider.iconName)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                          {provider.name}
                        </h3>
                        {provider.status === 'auto_detected' && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">
                            Auto-detected
                          </span>
                        )}
                        {provider.isLoggedIn && provider.status !== 'auto_detected' && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" /> Connected
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                        {provider.description}
                      </p>
                    </div>
                  </div>

                  <a
                    href={provider.docUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 p-1 rounded"
                    title="View documentation"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Authentication Input Section */}
                <div className="mt-4 space-y-3">
                  {provider.authType === 'api_key' ? (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        API Key {provider.id === 'gemini' && '(Auto-configured, or override)'}
                      </label>
                      <div className="relative">
                        <input
                          type={showKeys[provider.id] ? 'text' : 'password'}
                          value={provider.apiKey || ''}
                          onChange={(e) => onUpdateProvider(provider.id, { apiKey: e.target.value })}
                          placeholder={provider.keyHint || 'Enter API Key...'}
                          className="w-full pr-10 pl-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                        />
                        <button
                          type="button"
                          onClick={() => toggleShowKey(provider.id)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                        >
                          {showKeys[provider.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                        Ollama Base URL
                      </label>
                      <input
                        type="text"
                        value={provider.baseUrl || 'http://localhost:11434'}
                        onChange={(e) => onUpdateProvider(provider.id, { baseUrl: e.target.value })}
                        placeholder="http://localhost:11434"
                        className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600"
                      />
                    </div>
                  )}

                  {/* Model Selector */}
                  <div>
                    <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Target Model
                    </label>
                    <select
                      value={provider.selectedModel}
                      onChange={(e) => onUpdateProvider(provider.id, { selectedModel: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 font-mono"
                    >
                      {provider.availableModels.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.contextWindow}) {m.recommended ? '— Recommended' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Verify status message */}
                  {statusMsg && (
                    <div
                      className={`text-[11px] p-2 rounded-lg font-mono ${
                        statusMsg.success
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                          : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
                      }`}
                    >
                      {statusMsg.text}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-2 mt-5 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => handleVerify(provider)}
                  disabled={isVerifying}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg border border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 transition-colors flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                  <span>{isVerifying ? 'Testing...' : 'Verify Login'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onSelectActiveProvider(provider.id, provider.selectedModel)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-xs'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                  }`}
                >
                  <Radio className="w-3.5 h-3.5" />
                  <span>{isActive ? 'Active in Playground' : 'Use This Model'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
