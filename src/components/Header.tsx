import React from 'react';
import { Layers, Moon, Sun, Download, Plus } from 'lucide-react';

interface HeaderProps {
  activeTab: 'servers' | 'providers' | 'tools' | 'playground';
  setActiveTab: (tab: 'servers' | 'providers' | 'tools' | 'playground') => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  onOpenCustomModal: () => void;
  onOpenConfigModal: () => void;
  activeProviderName: string;
  activeModelName: string;
  activeServersCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  onOpenCustomModal,
  onOpenConfigModal,
  activeProviderName,
  activeModelName,
  activeServersCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-neutral-900/95 backdrop-blur border-b border-neutral-200 dark:border-neutral-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-neutral-900 font-semibold shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-lg tracking-tight text-neutral-900 dark:text-white whitespace-nowrap">
                MCP Studio
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono -mt-1">
                Protocol v2024-11-05
              </span>
            </div>
          </div>

          {/* Zone 2: Concise single-line navigation tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('servers')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === 'servers'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Servers & Plugins
            </button>
            <button
              onClick={() => setActiveTab('providers')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === 'providers'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Model Login & Gateway
            </button>
            <button
              onClick={() => setActiveTab('tools')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                activeTab === 'tools'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              Tool Inspector
            </button>
            <button
              onClick={() => setActiveTab('playground')}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeTab === 'playground'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <span>Playground</span>
              {activeServersCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200">
                  {activeServersCount} active
                </span>
              )}
            </button>
          </nav>

          {/* Zone 3: Quick Action & Theme Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Quick config export */}
            <button
              onClick={onOpenConfigModal}
              title="Import or Export Claude / Cursor MCP JSON Config"
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Dark mode switch */}
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle dark mode"
              className="p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Primary Action Button */}
            <button
              onClick={onOpenCustomModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-white rounded-lg shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Connect Server</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary tab strip */}
        <div className="md:hidden flex items-center gap-1 py-2 overflow-x-auto border-t border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('servers')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'servers'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Servers
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'providers'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Models
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'tools'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => setActiveTab('playground')}
            className={`px-3 py-1 text-xs rounded-md whitespace-nowrap ${
              activeTab === 'playground'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400'
            }`}
          >
            Playground
          </button>
        </div>
      </div>
    </header>
  );
};
