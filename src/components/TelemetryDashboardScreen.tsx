import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Activity, RotateCcw, ArrowRight } from 'lucide-react';
import { CelestialInfo, SimulationSummary, TelemetryDataPoint } from '../types';
import { soundFx } from '../lib/sound';

interface TelemetryDashboardScreenProps {
  summary: SimulationSummary;
  celestial: CelestialInfo;
  onContinueToResults: () => void;
  onReplay: () => void;
}

export const TelemetryDashboardScreen: React.FC<TelemetryDashboardScreenProps> = ({
  summary,
  celestial,
  onContinueToResults,
  onReplay,
}) => {
  const [scrubIndex, setScrubIndex] = useState<number>(summary.telemetryHistory.length - 1);
  const activePoint: TelemetryDataPoint = summary.telemetryHistory[scrubIndex] || summary.telemetryHistory[0];

  return (
    <div className="w-full min-h-[calc(100vh-100px)] py-4 px-2 sm:px-4 flex flex-col justify-between space-y-6 my-auto">
      
      {/* Header Bar */}
      <div className="lab-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-lg bg-[var(--accent-primary)] text-white text-[10px] font-mono font-bold uppercase">
              TELEMETRY LOG
            </span>
            <h2 className="text-sm sm:text-base font-display font-bold text-[var(--text-primary)]">
              EXPERIMENT ANALYSIS ({summary.height}M DROP — {celestial.name.toUpperCase()})
            </h2>
          </div>
          <p className="text-xs font-mono text-[var(--text-secondary)] mt-0.5">
            50Hz Time-Series Telemetry
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundFx.playButtonTap();
              onReplay();
            }}
            className="px-3.5 py-2 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent-cyan)] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RE-RUN SIMULATION</span>
          </button>

          <button
            onClick={() => {
              soundFx.playButtonTap();
              onContinueToResults();
            }}
            className="px-4 py-2 rounded-xl bg-[var(--accent-primary)] text-white font-display font-bold text-xs flex items-center gap-2 hover:brightness-110 shadow-md transition-all cursor-pointer glow-cyan"
          >
            <span>SUMMARY REPORT</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: Recharts Telemetry Graph + Scrubbing Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto items-stretch">
        
        {/* Left Column: Recharts Interactive Telemetry Chart (8 cols) */}
        <div className="lg:col-span-8 lab-card p-5 space-y-4 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-2 font-bold">
              <Activity className="w-4 h-4 text-[var(--accent-lime)]" /> G-FORCE &amp; ALTITUDE VS TIME
            </span>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-mono font-bold">
              <span className="flex items-center gap-1.5 text-[var(--accent-lime)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-lime)]" /> G-Force (g)
              </span>
              <span className="flex items-center gap-1.5 text-[var(--accent-cyan)]">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-cyan)]" /> Altitude (m)
              </span>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="w-full h-[280px] sm:h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={summary.telemetryHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" opacity={0.6} />
                <XAxis
                  dataKey="time"
                  stroke="var(--text-muted)"
                  tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  unit="s"
                />
                <YAxis
                  yAxisId="gForce"
                  orientation="left"
                  stroke="var(--accent-lime)"
                  tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  unit="g"
                />
                <YAxis
                  yAxisId="altitude"
                  orientation="right"
                  stroke="var(--accent-cyan)"
                  tick={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}
                  unit="m"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface-elevated)',
                    borderColor: 'var(--border-subtle)',
                    borderRadius: '12px',
                    color: 'var(--text-primary)',
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '12px',
                    boxShadow: 'var(--shadow-card)',
                  }}
                />
                <Line
                  yAxisId="gForce"
                  type="monotone"
                  dataKey="gForce"
                  stroke="var(--accent-lime)"
                  strokeWidth={2.5}
                  dot={false}
                  name="Felt G-Force"
                />
                <Line
                  yAxisId="altitude"
                  type="monotone"
                  dataKey="altitude"
                  stroke="var(--accent-cyan)"
                  strokeWidth={2}
                  dot={false}
                  name="Altitude"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Time Scrubber Slider */}
          <div className="space-y-1.5 pt-3 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-xs font-mono text-[var(--text-secondary)] font-bold">
              <span>SCRUB TIME T: <span className="text-[var(--accent-cyan)]">{activePoint.time.toFixed(2)}s</span></span>
              <span>PHASE: <span className="text-[var(--accent-lime)]">{activePoint.phase}</span></span>
            </div>
            <input
              type="range"
              min={0}
              max={summary.telemetryHistory.length - 1}
              value={scrubIndex}
              onChange={(e) => setScrubIndex(Number(e.target.value))}
              className="w-full h-2.5 bg-[var(--bg-surface-elevated)] rounded-lg appearance-none cursor-pointer accent-[var(--accent-primary)]"
            />
          </div>
        </div>

        {/* Right Column: Instant Scrub Telemetry Inspector (4 cols) */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-3">
          
          <div className="lab-card p-5 space-y-3">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider block font-bold">
              INSPECTED TIME STEP
            </span>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2.5">
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-[var(--text-secondary)]">Time:</span>
                <span className="font-bold text-base text-[var(--text-primary)]">{activePoint.time.toFixed(2)}s</span>
              </div>
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-[var(--text-secondary)]">G-Force:</span>
                <span className="font-bold text-base text-[var(--accent-lime)]">{activePoint.gForce.toFixed(2)}g</span>
              </div>
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-[var(--text-secondary)]">Altitude:</span>
                <span className="font-bold text-base text-[var(--accent-cyan)]">{activePoint.altitude.toFixed(1)}m</span>
              </div>
              <div className="flex justify-between items-baseline font-mono text-xs">
                <span className="text-[var(--text-secondary)]">Velocity:</span>
                <span className="font-bold text-base text-[var(--text-primary)]">{(activePoint.velocity * 3.6).toFixed(1)} km/h</span>
              </div>
            </div>
          </div>

          <div className="lab-card p-5 space-y-3">
            <span className="text-xs font-mono text-[var(--text-secondary)] uppercase tracking-wider block font-bold">
              EXPERIMENT METRIC HIGHLIGHTS
            </span>

            <div className="space-y-2 font-mono text-xs">
              <div className="flex justify-between p-2.5 rounded-lg bg-[var(--bg-surface-elevated)]">
                <span className="text-[var(--text-secondary)]">Peak G-Force:</span>
                <span className="font-bold text-[var(--accent-amber)]">{summary.peakG}g</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[var(--bg-surface-elevated)]">
                <span className="text-[var(--text-secondary)]">Max Velocity:</span>
                <span className="font-bold text-[var(--text-primary)]">{summary.maxVelocityKmH} km/h</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[var(--bg-surface-elevated)]">
                <span className="text-[var(--text-secondary)]">Free Fall Duration:</span>
                <span className="font-bold text-[var(--accent-lime)]">{summary.freeFallDuration}s</span>
              </div>
              <div className="flex justify-between p-2.5 rounded-lg bg-[var(--bg-surface-elevated)]">
                <span className="text-[var(--text-secondary)]">Braking Duration:</span>
                <span className="font-bold text-[var(--accent-cyan)]">{summary.brakingDuration}s</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <div>TELEMETRY ANALYSIS</div>
        <div>SIMULATION DATA</div>
      </div>
    </div>
  );
};
