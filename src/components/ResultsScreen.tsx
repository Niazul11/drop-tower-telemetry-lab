import React from 'react';
import { RotateCcw, ArrowRight, Activity, Gauge, Zap, ShieldCheck, Globe } from 'lucide-react';
import { CelestialBody, SimulationSummary } from '../types';
import { CELESTIAL_BODIES, calculatePhysicsPreview } from '../lib/physics';
import { soundFx } from '../lib/sound';

interface ResultsScreenProps {
  summary: SimulationSummary;
  onReplay: () => void;
  onSelectNewHeight: () => void;
  onSelectCelestial: (body: CelestialBody) => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  summary,
  onReplay,
  onSelectNewHeight,
  onSelectCelestial,
}) => {
  return (
    <div className="w-full min-h-[calc(100vh-100px)] py-4 px-2 sm:px-4 flex flex-col justify-between space-y-6 my-auto">
      
      {/* Header */}
      <div className="lab-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-[var(--accent-green)]">
        <div>
          <span className="px-2.5 py-0.5 rounded-lg bg-[var(--accent-green)] text-white text-[10px] font-mono font-bold uppercase">
            SIMULATION COMPLETE
          </span>
          <h2 className="text-base sm:text-xl font-display font-bold text-[var(--text-primary)] mt-1">
            SIMULATION REPORT: {summary.height}M DROP ON {summary.celestial.name.toUpperCase()}
          </h2>
          <p className="text-xs font-mono text-[var(--text-secondary)]">
            Summary Metrics &amp; Cross-Planetary Physics Comparisons
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playButtonTap();
              onReplay();
            }}
            className="px-4 py-2.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--accent-cyan)] text-xs font-mono font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RE-RUN SIMULATION</span>
          </button>

          <button
            onClick={() => {
              soundFx.playButtonTap();
              onSelectNewHeight();
            }}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent-primary)] text-white font-display font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-md transition-all cursor-pointer glow-cyan"
          >
            <span>NEW SIMULATION</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Primary Summary Metric Cards (4 Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Peak G-Force */}
        <div className="lab-card p-5 space-y-2 border-t-2 border-t-[var(--accent-amber)]">
          <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5 font-bold">
            <Activity className="w-4 h-4 text-[var(--accent-amber)]" /> PEAK G-FORCE
          </span>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--accent-amber)]">
            {summary.peakG} <span className="text-sm font-mono font-normal text-[var(--text-secondary)]">g</span>
          </p>
          <span className="text-[11px] font-mono text-[var(--text-muted)] block">Peak value during magnetic braking</span>
        </div>

        {/* Max Velocity */}
        <div className="lab-card p-5 space-y-2 border-t-2 border-t-[var(--accent-lime)]">
          <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5 font-bold">
            <Gauge className="w-4 h-4 text-[var(--accent-lime)]" /> MAX VELOCITY
          </span>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--text-primary)]">
            {summary.maxVelocityKmH} <span className="text-sm font-mono font-normal text-[var(--text-secondary)]">km/h</span>
          </p>
          <span className="text-[11px] font-mono text-[var(--text-muted)] block">Velocity prior to braking engagement</span>
        </div>

        {/* Weightless Duration */}
        <div className="lab-card p-5 space-y-2 border-t-2 border-t-[var(--accent-cyan)]">
          <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5 font-bold">
            <Zap className="w-4 h-4 text-[var(--accent-cyan)]" /> 0.0g FREE FALL
          </span>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--accent-cyan)]">
            {summary.freeFallDuration} <span className="text-sm font-mono font-normal text-[var(--text-secondary)]">s</span>
          </p>
          <span className="text-[11px] font-mono text-[var(--text-muted)] block">Duration of 0.0g free fall</span>
        </div>

        {/* Impact Energy */}
        <div className="lab-card p-5 space-y-2 border-t-2 border-t-[var(--accent-green)]">
          <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-[var(--accent-green)]" /> KINETIC ENERGY
          </span>
          <p className="text-3xl sm:text-4xl font-display font-extrabold text-[var(--accent-green)]">
            {summary.impactEnergykJ} <span className="text-sm font-mono font-normal text-[var(--text-secondary)]">kJ</span>
          </p>
          <span className="text-[11px] font-mono text-[var(--text-muted)] block">Kinetic energy dissipated by eddy brakes</span>
        </div>
      </div>

      {/* Cross-Celestial Comparison Matrix */}
      <div className="lab-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 font-bold">
            <Globe className="w-4 h-4 text-[var(--accent-cyan)]" /> CROSS-PLANETARY GRAVITY COMPARISON ({summary.height}M DROP)
          </span>
          <span className="text-xs font-mono text-[var(--text-muted)] hidden sm:inline">Tap any planet to simulate</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(Object.keys(CELESTIAL_BODIES) as CelestialBody[]).map((key) => {
            const body = CELESTIAL_BODIES[key];
            const prev = calculatePhysicsPreview(summary.height, key);
            const isCurrent = body.id === summary.celestial.id;

            return (
              <div
                key={key}
                onClick={() => {
                  soundFx.playButtonTap();
                  onSelectCelestial(key);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                  isCurrent
                    ? 'bg-[var(--bg-surface-elevated)] border-[var(--accent-primary)] shadow-md glow-cyan ring-1 ring-[var(--accent-cyan)]'
                    : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-cyan)]/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-[var(--text-primary)] flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: body.color }} />
                    {body.name}
                  </span>
                  <span className="text-xs font-mono text-[var(--accent-cyan)] font-bold">{body.gravity} m/s²</span>
                </div>

                <div className="space-y-1 font-mono text-xs text-[var(--text-secondary)] pt-1 border-t border-[var(--border-subtle)]/60">
                  <div className="flex justify-between">
                    <span>Fall Duration:</span>
                    <span className="font-bold text-[var(--text-primary)]">{prev.totalFallTime.toFixed(2)}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Velocity:</span>
                    <span className="font-bold text-[var(--text-primary)]">{prev.maxVelocityKmH.toFixed(0)} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Peak Braking:</span>
                    <span className="font-bold text-[var(--accent-amber)]">{prev.peakG.toFixed(2)}g</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <div>SIMULATION SUMMARY REPORT</div>
        <div>TELEMETRY ANALYSIS</div>
      </div>
    </div>
  );
};
