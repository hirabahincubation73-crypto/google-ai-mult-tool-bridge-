import React, { useState } from 'react';
import { X, Plus, Terminal, Globe, Server, Check } from 'lucide-react';
import { MCPServerConfig, TransportType } from '../types/mcp';

interface CustomServerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (server: MCPServerConfig) => void;
  initialServer?: MCPServerConfig | null;
}

export const CustomServerModal: React.FC<CustomServerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialServer,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialServer?.name || '');
  const [description, setDescription] = useState(initialServer?.description || '');
  const [category, setCategory] = useState<MCPServerConfig['category']>(initialServer?.category || 'custom');
  const [transport, setTransport] = useState<TransportType>(initialServer?.transport || 'stdio');
  const [command, setCommand] = useState(initialServer?.command || 'npx');
  const [argsStr, setArgsStr] = useState(initialServer?.args?.join(' ') || '-y @modelcontextprotocol/server-example');
  const [url, setUrl] = useState(initialServer?.url || 'http://localhost:8000/sse');
  const [envStr, setEnvStr] = useState(
    initialServer?.env ? Object.entries(initialServer.env).map(([k, v]) => `${k}=${v}`).join('\n') : ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Parse env string
    const envObj: Record<string, string> = {};
    if (envStr.trim()) {
      envStr.split('\n').forEach((line) => {
        const [k, ...rest] = line.split('=');
        if (k && rest.length > 0) {
          envObj[k.trim()] = rest.join('=').trim();
        }
      });
    }

    const newServer: MCPServerConfig = {
      id: initialServer?.id || `custom-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || 'Custom configured Model Context Protocol server.',
      category,
      author: 'Custom / Local',
      transport,
      command: transport === 'stdio' ? command.trim() : undefined,
      args: transport === 'stdio' ? argsStr.trim().split(/\s+/).filter(Boolean) : undefined,
      env: Object.keys(envObj).length > 0 ? envObj : undefined,
      url: transport === 'sse' ? url.trim() : undefined,
      iconName: transport === 'stdio' ? 'Terminal' : 'Globe',
      version: '1.0.0',
      isInstalled: true,
      isEnabled: true,
      status: 'connected',
      latencyMs: Math.floor(Math.random() * 25) + 10,
      lastPing: 'Just now',
      isCustom: true,
      tools: initialServer?.tools || [
        {
          name: `${name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_action`,
          description: `Custom action exposed by ${name}`,
          inputSchema: {
            type: 'object',
            properties: {
              input: { type: 'string', description: 'Execution parameter input' },
            },
          },
        },
      ],
    };

    onSave(newServer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-lg p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              {initialServer ? 'Configure MCP Server' : 'Connect Custom MCP Server'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Server Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Local PostgreSQL or Puppeteer Runner"
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief summary of functions provided..."
              className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100"
              >
                <option value="filesystem">Filesystem</option>
                <option value="developer">Developer</option>
                <option value="database">Database</option>
                <option value="web">Web & Search</option>
                <option value="productivity">Productivity</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Transport Type
              </label>
              <select
                value={transport}
                onChange={(e) => setTransport(e.target.value as TransportType)}
                className="w-full px-3 py-1.5 bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100 font-mono"
              >
                <option value="stdio">stdio (Local Subprocess)</option>
                <option value="sse">sse (HTTP Server-Sent Events)</option>
              </select>
            </div>
          </div>

          {transport === 'stdio' ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Command
                  </label>
                  <input
                    type="text"
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="npx, uvx, python"
                    className="w-full px-3 py-1.5 font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Arguments
                  </label>
                  <input
                    type="text"
                    value={argsStr}
                    onChange={(e) => setArgsStr(e.target.value)}
                    placeholder="-y @package/name arg1"
                    className="w-full px-3 py-1.5 font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Environment Variables (KEY=VALUE per line)
                </label>
                <textarea
                  rows={2}
                  value={envStr}
                  onChange={(e) => setEnvStr(e.target.value)}
                  placeholder="API_TOKEN=xyz&#10;BASE_DIR=/data"
                  className="w-full px-3 py-1.5 font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100"
                />
              </div>
            </>
          ) : (
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                SSE Endpoint URL
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://mcp.internal.company.com/sse"
                className="w-full px-3 py-1.5 font-mono bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg text-neutral-900 dark:text-neutral-100"
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white font-medium rounded-lg transition-colors"
            >
              Save & Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
