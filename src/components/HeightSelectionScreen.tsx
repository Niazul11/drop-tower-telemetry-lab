import React from 'react';
import { ArrowLeft, Play, Activity, Clock, Gauge, Zap, CheckCircle2 } from 'lucide-react';
import { CelestialBody, CelestialInfo } from '../types';
import { AVAILABLE_HEIGHTS, CELESTIAL_BODIES, calculatePhysicsPreview } from '../lib/physics';
import { soundFx } from '../lib/sound';
import { PlanetVisual } from './PlanetVisual';

interface HeightSelectionScreenProps {
  selectedHeight: number;
  onSelectHeight: (height: number) => void;
  celestial: CelestialInfo;
  onSelectCelestial: (body: CelestialBody) => void;
  onLaunch: () => void;
  onBack: () => void;
  reducedMotion?: boolean;
}

const GRAVITY_SPECS: Record<CelestialBody, { name: string; gravityText: string; gRatioText: string }> = {
  earth: { name: 'EARTH', gravityText: '9.81 m/s²', gRatioText: '1.00 g' },
  moon: { name: 'MOON', gravityText: '1.62 m/s²', gRatioText: '0.16 g' },
  mars: { name: 'MARS', gravityText: '3.72 m/s²', gRatioText: '0.38 g' },
  jupiter: { name: 'JUPITER', gravityText: '24.79 m/s²', gRatioText: '2.53 g' },
};

export const HeightSelectionScreen: React.FC<HeightSelectionScreenProps> = ({
  selectedHeight,
  onSelectHeight,
  celestial,
  onSelectCelestial,
  onLaunch,
  onBack,
}) => {
  const currentPreview = calculatePhysicsPreview(selectedHeight, celestial.id);

  return (
    <div className="w-full min-h-[calc(100vh-100px)] py-4 px-2 sm:px-4 flex flex-col justify-between space-y-6 my-auto">
      
      {/* Header Navigation Bar */}
      <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4">
        <button
          onClick={() => {
            soundFx.playButtonTap();
            onBack();
          }}
          className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)] text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>EXIT TO MAIN MENU</span>
        </button>

        <div className="text-right">
          <span className="text-[10px] font-mono text-[var(--accent-lime)] font-bold uppercase tracking-wider block">DROP PARAMETERS</span>
          <h2 className="text-sm sm:text-base font-display font-bold text-[var(--text-primary)]">SELECT DROP HEIGHT &amp; GRAVITY FIELD</h2>
        </div>
      </div>

      {/* Main Grid: Height Cards + Gravity Environment + Preview Telemetry Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto">
        
        {/* Left Column: Configuration Steps 1 & 2 (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STEP 1: SELECT DROP HEIGHT */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--accent-cyan)] flex items-center justify-center font-mono text-[10px] font-bold">1</span>
                STEP 1 — SELECT DROP HEIGHT
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {AVAILABLE_HEIGHTS.map((hVal) => {
                const preview = calculatePhysicsPreview(hVal, celestial.id);
                const isSelected = hVal === selectedHeight;

                return (
                  <div
                    key={hVal}
                    onClick={() => {
                      soundFx.playHeightSelect();
                      onSelectHeight(hVal);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 min-h-[110px] ${
                      isSelected
                        ? 'bg-[var(--bg-surface-elevated)] border-[var(--accent-primary)] shadow-lg glow-cyan ring-1 ring-[var(--accent-cyan)]'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)]">
                        {hVal}<span className="text-base text-[var(--text-muted)] font-mono font-normal">m</span>
                      </span>
                      {isSelected ? (
                        <span className="px-2 py-0.5 rounded-md bg-[var(--accent-primary)] text-white text-[10px] font-mono font-bold flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" /> ACTIVE
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--text-muted)]">SELECT</span>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-2 border-t border-[var(--border-subtle)]/60 text-[10px] sm:text-[11px] font-mono text-[var(--text-secondary)]">
                      <div>
                        <span className="block text-[9px] text-[var(--text-muted)]">FALL TIME</span>
                        <span className="font-bold text-[var(--text-primary)]">{preview.totalFallTime.toFixed(2)}s</span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-[var(--text-muted)]">MAX VELOCITY</span>
                        <span className="font-bold text-[var(--text-primary)]">{preview.maxVelocityKmH.toFixed(0)} <span className="text-[8px]">km/h</span></span>
                      </div>
                      <div>
                        <span className="block text-[9px] text-[var(--text-muted)]">PEAK G-FORCE</span>
                        <span className="font-bold text-[var(--accent-amber)]">{preview.peakG.toFixed(1)}g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* STEP 2: SELECT GRAVITY FIELD */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider font-bold flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--accent-lime)] flex items-center justify-center font-mono text-[10px] font-bold">2</span>
                STEP 2 — SELECT GRAVITY FIELD
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(Object.keys(CELESTIAL_BODIES) as CelestialBody[]).map((key) => {
                const body = CELESTIAL_BODIES[key];
                const spec = GRAVITY_SPECS[key];
                const isSelected = body.id === celestial.id;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      soundFx.playButtonTap();
                      onSelectCelestial(key);
                    }}
                    className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 group ${
                      isSelected
                        ? 'bg-[var(--bg-surface-elevated)] border-[var(--accent-primary)] ring-2 ring-[var(--accent-primary)]/50 shadow-lg -translate-y-0.5'
                        : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--border-strong)] hover:bg-[var(--bg-surface-elevated)]/50'
                    }`}
                  >
                    {/* Top Row: Planet Visual + Indicator */}
                    <div className="flex items-center justify-between w-full">
                      <PlanetVisual id={key} isSelected={isSelected} size="md" />
                      {isSelected ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-[var(--accent-primary)] text-white uppercase tracking-wider shadow-sm">
                          SELECTED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]">
                          SELECT
                        </span>
                      )}
                    </div>

                    {/* Planet Info */}
                    <div className="space-y-1">
                      <div className="font-display font-extrabold text-sm tracking-wide text-[var(--text-primary)]">
                        {spec.name}
                      </div>
                      <div className="flex items-baseline justify-between font-mono text-xs">
                        <span className="font-bold text-[var(--text-primary)]">{spec.gravityText}</span>
                        <span className="text-[10px] font-semibold text-[var(--accent-lime)]">{spec.gRatioText}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Calculated Physics Preview Panel (5 cols) */}
        <div className="lg:col-span-5 lab-card p-5 sm:p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--accent-lime)] font-bold mb-2">
              <Zap className="w-4 h-4 text-[var(--accent-lime)]" /> CALCULATED SIMULATION PREVIEW
            </div>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-[var(--text-primary)] mb-1 flex items-center gap-2">
              <span>{selectedHeight}m Drop on {celestial.name}</span>
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {celestial.description}
            </p>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[var(--accent-cyan)]" /> Estimated Fall Time
              </span>
              <span className="font-bold text-base text-[var(--text-primary)]">{currentPreview.totalFallTime.toFixed(2)}s</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <Gauge className="w-4 h-4 text-[var(--accent-lime)]" /> Maximum Velocity
              </span>
              <span className="font-bold text-base text-[var(--text-primary)]">{currentPreview.maxVelocityKmH.toFixed(1)} km/h</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex items-center justify-between">
              <span className="text-[var(--text-secondary)] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--accent-amber)]" /> Peak Braking G-Force
              </span>
              <span className="font-bold text-base text-[var(--accent-amber)]">{currentPreview.peakG.toFixed(2)} g</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              soundFx.playArmLatch();
              onLaunch();
            }}
            className="w-full py-4 rounded-xl bg-[var(--accent-primary)] text-white font-display font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 hover:brightness-110 active:scale-95 shadow-xl transition-all cursor-pointer glow-cyan"
          >
            <Play className="w-5 h-5 fill-current text-white" />
            <span>ARM TOWER &amp; BEGIN COUNTDOWN</span>
          </button>
        </div>
      </div>

      {/* Footer Status */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <div>SIMULATION PARAMETERS READY</div>
        <div className="text-[var(--accent-lime)]">READY FOR DROP</div>
      </div>
    </div>
  );
};
