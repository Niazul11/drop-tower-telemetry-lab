import React from 'react';
import { X, ShieldAlert, Eye, Volume2, Monitor, Sparkles, Sun, Moon } from 'lucide-react';
import { AccessibilitySettings } from '../types';
import { soundFx } from '../lib/sound';

interface AccessibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: AccessibilitySettings) => void;
}

export const AccessibilityModal: React.FC<AccessibilityModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof AccessibilitySettings) => {
    soundFx.playButtonTap();
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="lab-card w-full max-w-xl p-0 overflow-hidden flex flex-col shadow-2xl border-[var(--border-highlight)]">
        
        {/* Header */}
        <div className="bg-[var(--bg-surface-elevated)] p-5 border-b border-[var(--border-subtle)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-bold shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-display font-bold text-[var(--text-primary)]">
                EXHIBIT &amp; ACCESSIBILITY SETTINGS
              </h2>
              <p className="text-xs font-mono text-[var(--accent-cyan)]">
                ADA COMPLIANCE &amp; COLOR SCHEME CONTROLS
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundFx.playButtonTap();
              onClose();
            }}
            className="p-2 rounded-xl bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Body */}
        <div className="p-6 space-y-4 font-sans text-xs">
          
          {/* Color Theme Selector */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[var(--accent-lime)]" />
              <span className="font-display font-bold text-[var(--text-primary)] text-sm">COLOR PALETTE / THEME</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              {(['dark', 'light', 'high-contrast'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    soundFx.playButtonTap();
                    onUpdateSettings({
                      ...settings,
                      themeMode: mode,
                      highContrast: mode === 'high-contrast',
                    });
                  }}
                  className={`py-2 px-3 rounded-lg border text-center transition-all text-xs font-bold cursor-pointer ${
                    settings.themeMode === mode
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {mode === 'dark' ? 'DARK (CHARCOAL)' : mode === 'light' ? 'LIGHT (LAB)' : 'HIGH CONTRAST'}
                </button>
              ))}
            </div>
          </div>

          {/* Reduced Motion */}
          <div className="flex items-center justify-between bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-[var(--accent-cyan)]" />
              <div>
                <span className="font-display font-bold text-[var(--text-primary)] block text-sm">PREFERS REDUCED MOTION</span>
                <span className="text-[var(--text-secondary)] text-[11px] font-mono">Disables fast 3D camera sweeps &amp; spring animations</span>
              </div>
            </div>

            <button
              onClick={() => toggle('reducedMotion')}
              className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                settings.reducedMotion ? 'bg-[var(--accent-lime)]' : 'bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-all ${
                  settings.reducedMotion ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Audio Synthesizer */}
          <div className="flex items-center justify-between bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <Volume2 className="w-5 h-5 text-[var(--accent-amber)]" />
              <div>
                <span className="font-display font-bold text-[var(--text-primary)] block text-sm">EXHIBIT SOUND SYNTHESIS</span>
                <span className="text-[var(--text-secondary)] text-[11px] font-mono">Pneumatic drops, countdown produce real-time Web Audio FX</span>
              </div>
            </div>

            <button
              onClick={() => toggle('audioEnabled')}
              className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${
                settings.audioEnabled ? 'bg-[var(--accent-lime)]' : 'bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-[var(--bg-app)] absolute top-0.5 transition-all ${
                  settings.audioEnabled ? 'left-6.5' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          {/* Kiosk Canvas Scaling */}
          <div className="bg-[var(--bg-surface)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center gap-2">
              <Monitor className="w-4 h-4 text-[var(--accent-lime)]" />
              <span className="font-display font-bold text-[var(--text-primary)] text-sm">DISPLAY TARGET SCALE</span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono">
              {(['normal', 'large', 'kiosk_55'] as const).map((scale) => (
                <button
                  key={scale}
                  onClick={() => {
                    soundFx.playButtonTap();
                    onUpdateSettings({ ...settings, kioskScale: scale });
                  }}
                  className={`py-2 rounded-lg border text-center transition-all text-xs font-bold cursor-pointer ${
                    settings.kioskScale === scale
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-sm'
                      : 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {scale === 'normal' ? 'DESKTOP' : scale === 'large' ? 'TABLET' : '55" KIOSK'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
