import React from 'react';
import { Settings, X, Moon, Sun, Monitor, Volume2, VolumeX, Eye, RotateCcw, Check } from 'lucide-react';
import { AccessibilitySettings } from '../types';
import { soundFx } from '../lib/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  onResetExperience: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetExperience,
}) => {
  if (!isOpen) return null;

  const handleToggleTheme = (mode: 'dark' | 'light' | 'system') => {
    soundFx.playButtonTap();
    onUpdateSettings((prev) => ({ ...prev, themeMode: mode }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="wpf-card max-w-lg w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[var(--accent-primary)]" />
            <h3 className="text-base font-bold text-[var(--text-primary)]">System Settings & Accessibility</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-mono cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Theme Settings */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">
            1. DISPLAY THEME MODE
          </span>

          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleToggleTheme('dark')}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.themeMode === 'dark'
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-bold'
                  : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Moon className="w-4 h-4" />
              <span className="text-xs">Dark Charcoal</span>
            </button>

            <button
              onClick={() => handleToggleTheme('light')}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.themeMode === 'light'
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-bold'
                  : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sun className="w-4 h-4" />
              <span className="text-xs">Metro Light</span>
            </button>

            <button
              onClick={() => handleToggleTheme('system')}
              className={`p-3 rounded-lg border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                settings.themeMode === 'system'
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-bold'
                  : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Monitor className="w-4 h-4" />
              <span className="text-xs">Auto System</span>
            </button>
          </div>
        </div>

        {/* Accessibility Options */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">
            2. ACCESSIBILITY PREFERENCES
          </span>

          <div className="space-y-2">
            {/* Reduced Motion */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] cursor-pointer">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Reduce Motion Animations</span>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, reducedMotion: e.target.checked }))
                }
                className="w-4 h-4 accent-[var(--accent-primary)] cursor-pointer"
              />
            </label>

            {/* High Contrast */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] cursor-pointer">
              <span className="text-xs font-semibold text-[var(--text-primary)]">High Contrast Colors</span>
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, highContrast: e.target.checked }))
                }
                className="w-4 h-4 accent-[var(--accent-primary)] cursor-pointer"
              />
            </label>

            {/* Audio Effects */}
            <label className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] cursor-pointer">
              <span className="text-xs font-semibold text-[var(--text-primary)]">Procedural Audio Effects</span>
              <input
                type="checkbox"
                checked={settings.audioEnabled}
                onChange={(e) =>
                  onUpdateSettings((prev) => ({ ...prev, audioEnabled: e.target.checked }))
                }
                className="w-4 h-4 accent-[var(--accent-primary)] cursor-pointer"
              />
            </label>
          </div>
        </div>

        {/* Font / Kiosk Display Scale */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider block">
            3. DISPLAY SCALE / FONT SIZE
          </span>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {(['normal', 'large', 'kiosk_55'] as const).map((scale) => (
              <button
                key={scale}
                onClick={() => {
                  soundFx.playButtonTap();
                  onUpdateSettings((prev) => ({ ...prev, kioskScale: scale }));
                }}
                className={`p-2.5 rounded-lg border font-mono transition-all cursor-pointer ${
                  settings.kioskScale === scale
                    ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] font-bold'
                    : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]'
                }`}
              >
                {scale === 'normal' ? '100% Desktop' : scale === 'large' ? '125% Tablet' : '150% Kiosk'}
              </button>
            ))}
          </div>
        </div>

        {/* Reset Actions */}
        <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <button
            onClick={() => {
              onResetExperience();
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-[var(--bg-surface-elevated)] text-[var(--accent-red)] border border-[var(--border-subtle)] hover:border-[var(--accent-red)] text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET EXHIBIT SESSION</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[var(--accent-primary)] text-white text-xs font-bold hover:brightness-110 cursor-pointer"
          >
            SAVE & CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};
