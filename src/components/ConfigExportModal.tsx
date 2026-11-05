import React, { useState } from 'react';
import { X, Copy, Check, Download, Upload, FileCode, CheckCircle2 } from 'lucide-react';
import { MCPServerConfig } from '../types/mcp';

interface ConfigExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  servers: MCPServerConfig[];
  onImportServers: (newServers: MCPServerConfig[]) => void;
}

export const ConfigExportModal: React.FC<ConfigExportModalProps> = ({
  isOpen,
  onClose,
  servers,
  onImportServers,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [copied, setCopied] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Generate standard Claude Desktop / Cursor MCP config JSON
  const mcpServersConfig: Record<string, any> = {};
  servers
    .filter((s) => s.isInstalled)
    .forEach((s) => {
      const key = s.id.replace('mcp-', '');
      if (s.transport === 'stdio') {
        mcpServersConfig[key] = {
          command: s.command || 'npx',
          args: s.args || [],
          ...(s.env && Object.keys(s.env).length > 0 ? { env: s.env } : {}),
        };
      } else {
        mcpServersConfig[key] = {
          url: s.url,
          transport: 'sse',
        };
      }
    });

  const fullConfigJson = JSON.stringify({ mcpServers: mcpServersConfig }, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullConfigJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([fullConfigJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'claude_desktop_config.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importJson);
      const rootServers = parsed.mcpServers || parsed;
      const imported: MCPServerConfig[] = [];

      for (const [key, val] of Object.entries<any>(rootServers)) {
        imported.push({
          id: `imported-${key}-${Date.now()}`,
          name: key.charAt(0).toUpperCase() + key.slice(1) + ' Server',
          description: `Imported MCP server from external config`,
          category: 'custom',
          author: 'Imported',
          transport: val.transport === 'sse' || val.url ? 'sse' : 'stdio',
          command: val.command || 'npx',
          args: val.args || [],
          env: val.env,
          url: val.url,
          iconName: val.url ? 'Globe' : 'Terminal',
          version: '1.0.0',
          isInstalled: true,
          isEnabled: true,
          status: 'connected',
          latencyMs: 20,
          isCustom: true,
          tools: [
            {
              name: `${key}_action`,
              description: `Action on ${key}`,
              inputSchema: { type: 'object', properties: {} },
            },
          ],
        });
      }

      if (imported.length === 0) {
        setImportStatus('No servers found in JSON. Expected format: { "mcpServers": { ... } }');
        return;
      }

      onImportServers(imported);
      setImportStatus(`Successfully imported ${imported.length} MCP servers!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setImportStatus(`Invalid JSON syntax: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl w-full max-w-xl p-6 shadow-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-neutral-900 dark:text-neutral-100" />
            <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              MCP Configuration Manager
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'export'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Export (claude_desktop_config.json)
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-1.5 rounded-md transition-colors ${
              activeTab === 'import'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Import Existing Config
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="space-y-3">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Copy or download this configuration directly into Claude Desktop (`claude_desktop_config.json`), Cursor, or any MCP client.
            </p>

            <div className="relative">
              <pre className="p-3 bg-neutral-900 text-neutral-100 rounded-xl font-mono text-xs overflow-x-auto max-h-72 border border-neutral-800">
                {fullConfigJson}
              </pre>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={handleCopy}
                className="px-3.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white rounded-lg border border-neutral-200 dark:border-neutral-700 flex items-center gap-1.5 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard' : 'Copy JSON'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Config</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Paste your existing `claude_desktop_config.json` or Cursor MCP settings below to import and connect servers:
            </p>

            <textarea
              rows={8}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              placeholder={`{\n  "mcpServers": {\n    "custom-sqlite": {\n      "command": "uvx",\n      "args": ["mcp-server-sqlite"]\n    }\n  }\n}`}
              className="w-full p-3 font-mono text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl text-neutral-900 dark:text-neutral-100 focus:outline-hidden"
            />

            {importStatus && (
              <div
                className={`text-xs p-2 rounded-lg font-mono ${
                  importStatus.includes('Successfully')
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300'
                }`}
              >
                {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-neutral-600 dark:text-neutral-400"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={!importJson.trim()}
                className="px-4 py-1.5 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-lg disabled:opacity-40 transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Servers</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
