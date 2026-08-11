import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Activity, Gauge, Clock, ShieldCheck, Zap, ArrowRight, Pause, Play, RotateCcw } from 'lucide-react';
import { CelestialInfo, SimulationPhase, TelemetryDataPoint } from '../types';
import { ThreeTowerCanvas } from './ThreeTowerCanvas';
import { generateFullTelemetrySeries } from '../lib/physics';
import { soundFx } from '../lib/sound';

interface LiveSimulationScreenProps {
  height: number;
  celestial: CelestialInfo;
  onSimulationComplete: (history: TelemetryDataPoint[]) => void;
  reducedMotion?: boolean;
}

export const LiveSimulationScreen: React.FC<LiveSimulationScreenProps> = ({
  height,
  celestial,
  onSimulationComplete,
  reducedMotion,
}) => {
  // Synchronous, immediate physics time series calculation
  const summary = useMemo(() => {
    return generateFullTelemetrySeries(height, celestial.id);
  }, [height, celestial.id]);

  const fullSeries = summary.telemetryHistory;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const hasTriggeredCompleteRef = useRef<boolean>(false);

  // Reset completion state when inputs change
  useEffect(() => {
    hasTriggeredCompleteRef.current = false;
    setCurrentIndex(0);
    setIsPaused(false);
  }, [height, celestial.id]);

  // Robust timer playback ticker (40 fps / 25ms per step)
  useEffect(() => {
    if (fullSeries.length === 0 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= fullSeries.length - 1) {
          clearInterval(interval);
          if (!hasTriggeredCompleteRef.current) {
            hasTriggeredCompleteRef.current = true;
            soundFx.playCompleteChime();
            setTimeout(() => {
              onSimulationComplete(fullSeries);
            }, 600);
          }
          return prev;
        }

        const currentPoint = fullSeries[prev];
        const nextPoint = fullSeries[prev + 1];

        // Trigger procedural sound on state transition & continuous effects
        if (currentPoint && nextPoint) {
          if (currentPoint.phase !== nextPoint.phase) {
            if (nextPoint.phase === 'FREE_FALL') soundFx.playReleaseLatch();
            if (nextPoint.phase === 'BRAKING') soundFx.playBrakeEngage(nextPoint.gForce);
            if (nextPoint.phase === 'SAFE') soundFx.playLandingImpact();
          } else {
            // Subtle continuous sound ticks
            if (nextPoint.phase === 'FREE_FALL' && prev % 4 === 0) {
              const maxV = summary.maxVelocityMetersPerSec || 20;
              soundFx.playFreefallAirRush(Math.min(1.0, nextPoint.velocity / maxV));
            } else if (nextPoint.phase === 'BRAKING' && prev % 3 === 0) {
              soundFx.playBrakeEngage(nextPoint.gForce);
            }
          }
        }

        return prev + 1;
      });
    }, 25);

    return () => clearInterval(interval);
  }, [fullSeries, isPaused, onSimulationComplete]);

  const currentDataPoint: TelemetryDataPoint = fullSeries[currentIndex] || fullSeries[0] || {
    time: 0,
    altitude: height,
    velocity: 0,
    acceleration: celestial.gravity,
    gForce: 1.0,
    apparentWeightlessness: 0,
    phase: 'ARMED',
  };

  const phase: SimulationPhase = currentDataPoint.phase;
  const history = fullSeries.slice(0, currentIndex + 1);

  // Phase badge
  const renderPhaseBadge = () => {
    switch (phase) {
      case 'FREE_FALL':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--accent-lime)] text-[#07111F] text-xs font-mono font-bold uppercase animate-pulse shadow-sm">
            <Zap className="w-3.5 h-3.5 fill-current" /> 1. FREE FALL (0.0g)
          </div>
        );
      case 'BRAKING':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--accent-amber)] text-white text-xs font-mono font-bold uppercase animate-pulse shadow-sm">
            <Activity className="w-3.5 h-3.5" /> 2. MAGNETIC BRAKING
          </div>
        );
      case 'SAFE':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--accent-green)] text-white text-xs font-mono font-bold uppercase shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5" /> 3. AT REST
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--accent-cyan)] text-white text-xs font-mono font-bold uppercase">
            ARMED
          </div>
        );
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] py-4 px-2 sm:px-4 flex flex-col justify-between space-y-4 my-auto">
      
      {/* Top Header Controls Bar */}
      <div className="lab-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {renderPhaseBadge()}
          <div>
            <h2 className="text-sm sm:text-base font-display font-bold text-[var(--text-primary)]">
              SIMULATED TELEMETRY STREAM ({height}M DROP)
            </h2>
            <p className="text-[11px] font-mono text-[var(--text-secondary)]">
              GRAVITY FIELD: {celestial.name.toUpperCase()} ({celestial.gravity} m/s²)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Pause / Play */}
          <button
            onClick={() => {
              soundFx.playButtonTap();
              setIsPaused(!isPaused);
            }}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-mono text-xs hover:border-[var(--accent-cyan)] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-[var(--accent-green)] fill-current" /> : <Pause className="w-3.5 h-3.5 text-[var(--accent-amber)] fill-current" />}
            <span>{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          {/* Reset Live Run */}
          <button
            onClick={() => {
              soundFx.playButtonTap();
              hasTriggeredCompleteRef.current = false;
              setCurrentIndex(0);
              setIsPaused(false);
            }}
            className="p-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)] transition-all cursor-pointer"
            title="Restart Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Skip / Direct Analysis */}
          <button
            onClick={() => {
              soundFx.playButtonTap();
              hasTriggeredCompleteRef.current = true;
              onSimulationComplete(fullSeries);
            }}
            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-display font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-md transition-all cursor-pointer glow-cyan"
          >
            <span>VIEW ANALYSIS</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: 3D Scene + Real-time Telemetry Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-stretch">
        
        {/* Left Column: 3D Tower Canvas */}
        <div className="lg:col-span-7 h-[360px] sm:h-[440px] lg:h-[480px] relative rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-xl">
          <ThreeTowerCanvas
            currentHeight={height}
            currentAltitude={currentDataPoint.altitude}
            phase={phase}
            celestial={celestial}
            reducedMotion={reducedMotion}
          />

          {/* Altitude Tape Overlay on right edge */}
          <div className="absolute top-4 right-4 bottom-4 w-11 bg-[var(--bg-surface)]/90 backdrop-blur-md border border-[var(--border-subtle)] rounded-xl p-1.5 flex flex-col justify-between items-center text-[10px] font-mono text-[var(--text-secondary)]">
            <span className="font-bold text-[var(--accent-cyan)]">{height}m</span>
            <div className="w-2 bg-[var(--bg-surface-elevated)] flex-1 my-2 rounded-full relative overflow-hidden">
              <div
                className="w-full bg-[var(--accent-cyan)] transition-all duration-75 absolute bottom-0"
                style={{ height: `${(currentDataPoint.altitude / height) * 100}%` }}
              />
            </div>
            <span className="font-bold text-[var(--text-primary)]">0m</span>
          </div>
        </div>

        {/* Right Column: Digital Telemetry Dashboards */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          
          {/* Felt G-Force Gauge */}
          <div className="lab-card p-5 flex flex-col items-center justify-center text-center relative overflow-hidden">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5 mb-1 font-bold">
              <Activity className="w-4 h-4 text-[var(--accent-lime)]" /> FELT G-FORCE
            </span>

            <div className="my-2 flex items-baseline gap-2">
              <span className={`text-6xl font-display font-extrabold transition-colors ${
                phase === 'FREE_FALL'
                  ? 'text-[var(--accent-lime)]'
                  : phase === 'BRAKING'
                  ? 'text-[var(--accent-amber)]'
                  : 'text-[var(--accent-green)]'
              }`}>
                {currentDataPoint.gForce.toFixed(2)}
              </span>
              <span className="text-2xl font-mono text-[var(--text-secondary)]">g</span>
            </div>

            <div className="w-full bg-[var(--bg-surface-elevated)] h-3 rounded-full overflow-hidden mt-2 border border-[var(--border-subtle)]">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  phase === 'FREE_FALL'
                    ? 'bg-[var(--accent-lime)]'
                    : phase === 'BRAKING'
                    ? 'bg-[var(--accent-amber)]'
                    : 'bg-[var(--accent-green)]'
                }`}
                style={{ width: `${Math.min(100, (currentDataPoint.gForce / 5.0) * 100)}%` }}
              />
            </div>

            <span className="text-xs font-mono text-[var(--text-secondary)] mt-2 font-medium">
              {phase === 'FREE_FALL'
                ? 'Apparent Weightlessness (0.00g)'
                : phase === 'BRAKING'
                ? 'Magnetic Eddy-Current Deceleration'
                : 'At Rest'}
            </span>
          </div>

          {/* Velocity & Altitude Meters */}
          <div className="grid grid-cols-2 gap-3">
            {/* Velocity */}
            <div className="lab-card p-4">
              <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5 font-bold">
                <Gauge className="w-3.5 h-3.5 text-[var(--accent-cyan)]" /> VELOCITY
              </span>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--text-primary)] my-1">
                {(currentDataPoint.velocity * 3.6).toFixed(1)} <span className="text-xs font-mono text-[var(--text-secondary)]">km/h</span>
              </p>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                ({currentDataPoint.velocity.toFixed(1)} m/s)
              </span>
            </div>

            {/* Altitude */}
            <div className="lab-card p-4">
              <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center gap-1.5 font-bold">
                <Clock className="w-3.5 h-3.5 text-[var(--accent-lime)]" /> ALTITUDE
              </span>
              <p className="text-2xl sm:text-3xl font-display font-extrabold text-[var(--accent-cyan)] my-1">
                {currentDataPoint.altitude.toFixed(1)} <span className="text-xs font-mono text-[var(--text-secondary)]">m</span>
              </p>
              <span className="text-xs font-mono text-[var(--text-muted)]">
                Time: {currentDataPoint.time.toFixed(2)}s
              </span>
            </div>
          </div>

          {/* 50Hz Data Sparkline Stream */}
          <div className="lab-card p-4 space-y-2">
            <span className="text-xs font-mono text-[var(--text-secondary)] flex items-center justify-between font-bold">
              <span>G-FORCE TELEMETRY STREAM (50Hz)</span>
              <span className="text-[10px] text-[var(--accent-lime)]">Progress: {Math.round((currentIndex / Math.max(1, fullSeries.length - 1)) * 100)}%</span>
            </span>

            <div className="w-full h-16 bg-[var(--bg-surface-deep)] rounded-xl border border-[var(--border-subtle)] flex items-end p-2 gap-1 overflow-hidden">
              {history.slice(-30).map((dp, idx) => (
                <div
                  key={idx}
                  className={`flex-1 rounded-t transition-all ${
                    dp.phase === 'FREE_FALL'
                      ? 'bg-[var(--accent-lime)]'
                      : dp.phase === 'BRAKING'
                      ? 'bg-[var(--accent-amber)]'
                      : 'bg-[var(--accent-green)]'
                  }`}
                  style={{
                    height: `${Math.max(10, Math.min(100, (dp.gForce / 5.0) * 100))}%`,
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <div>MAGNETIC BRAKES ENGAGE AT 25% ALTITUDE</div>
        <div>SIMULATED TELEMETRY DATA</div>
      </div>
    </div>
  );
};
