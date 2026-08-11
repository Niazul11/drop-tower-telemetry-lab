import React from 'react';
import { Settings, Volume2, VolumeX, RotateCcw, Moon, Sun, Monitor, Activity } from 'lucide-react';
import { soundFx } from '../lib/sound';

interface HeaderNavigationProps {
  onOpenSettings: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  onResetExperience: () => void;
  themeMode: 'dark' | 'light' | 'system';
  onToggleTheme: () => void;
}

export const HeaderNavigation: React.FC<HeaderNavigationProps> = ({
  onOpenSettings,
  audioEnabled,
  onToggleAudio,
  onResetExperience,
  themeMode,
  onToggleTheme,
}) => {
  return (
    <header className="w-full bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] px-3 sm:px-6 py-3 flex flex-col md:flex-row items-center justify-between gap-3 sticky top-0 z-40 shadow-lg backdrop-blur-md">
      
      {/* Brand Header */}
      <div 
        className="flex items-center gap-3 cursor-pointer group" 
        onClick={onResetExperience}
        title="Return to Exhibit Entrance"
      >
        <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)] text-white flex items-center justify-center font-display font-bold text-base shadow-md group-hover:scale-105 transition-transform">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm sm:text-base font-display font-bold tracking-tight text-[var(--text-primary)]">
              Drop Tower Telemetry Lab
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--accent-lime)] border border-[var(--border-subtle)] uppercase">
              SIMULATION ACTIVE
            </span>
          </div>
          <p className="text-[11px] font-mono text-[var(--text-secondary)] hidden sm:block">
            Free Fall Physics &amp; Magnetic Eddy-Current Braking
          </p>
        </div>
      </div>

      {/* Right: Quick Controls */}
      <div className="flex items-center gap-2">
        
        {/* Quick Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)] transition-all cursor-pointer"
          title={`Theme: ${themeMode.toUpperCase()} (Click to toggle)`}
        >
          {themeMode === 'dark' ? (
            <Moon className="w-4 h-4 text-[var(--accent-cyan)]" />
          ) : themeMode === 'light' ? (
            <Sun className="w-4 h-4 text-[var(--accent-amber)]" />
          ) : (
            <Monitor className="w-4 h-4 text-[var(--accent-primary)]" />
          )}
        </button>

        {/* Mute/Unmute Audio */}
        <button
          onClick={onToggleAudio}
          className={`p-2 rounded-xl border transition-all cursor-pointer ${
            audioEnabled
              ? 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--accent-lime)] hover:border-[var(--accent-lime)]'
              : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
          }`}
          title={audioEnabled ? 'Audio Effects Active (Click to Mute)' : 'Audio Muted (Click to Enable)'}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)] transition-all cursor-pointer flex items-center gap-1.5"
          title="Settings & Accessibility"
        >
          <Settings className="w-4 h-4" />
          <span className="text-xs font-mono font-medium hidden lg:inline">SETTINGS</span>
        </button>

        {/* Reset Home */}
        <button
          onClick={onResetExperience}
          className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent-red)] hover:border-[var(--accent-red)] transition-all cursor-pointer"
          title="Reset Exhibit to Landing View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
