import React, { useState } from 'react';
import { Play, ArrowRight, Activity, Gauge, Zap, Sparkles, BookOpen, Layers, ShieldCheck, Compass } from 'lucide-react';
import { CelestialInfo } from '../types';
import { soundFx } from '../lib/sound';

interface LandingScreenProps {
  onStart: () => void;
  celestial: CelestialInfo;
  reducedMotion?: boolean;
}

export const LandingScreen: React.FC<LandingScreenProps> = ({
  onStart,
  celestial,
}) => {
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <div className="w-full min-h-[calc(100vh-100px)] py-6 px-2 sm:px-4 flex flex-col justify-between space-y-8 my-auto">
      
      {/* Hero Welcome Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto">
        
        {/* Left Column: Title & Primary Action */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--accent-lime)] font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-lime)]" />
            <span>INTERACTIVE SCIENCE MUSEUM EXHIBIT</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-extrabold tracking-tight text-[var(--text-primary)] leading-none">
            Drop Tower <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-lime)] to-[var(--accent-teal)]">
              Telemetry Lab
            </span>
          </h1>

          <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-xl leading-relaxed">
            Simulate free fall acceleration, apparent weightlessness (0.0g), and non-contact magnetic eddy-current braking in an interactive 3D physics laboratory.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => {
                soundFx.playButtonTap();
                onStart();
              }}
              className="px-7 py-4 rounded-xl bg-[var(--accent-primary)] text-white font-display font-bold text-sm sm:text-base flex items-center gap-3 shadow-xl hover:brightness-110 active:scale-95 transition-all cursor-pointer glow-cyan"
            >
              <Play className="w-5 h-5 fill-current text-white" />
              <span>START DROP EXPERIMENT</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => {
                soundFx.playButtonTap();
                setShowHowItWorks(true);
              }}
              className="px-6 py-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-semibold text-sm hover:border-[var(--accent-cyan)] hover:text-[var(--accent-cyan)] transition-all cursor-pointer flex items-center gap-2 shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-[var(--accent-cyan)]" />
              <span>EXHIBIT GUIDE</span>
            </button>
          </div>
        </div>

        {/* Right Column: Feature Summary Cards */}
        <div className="lg:col-span-5 grid grid-cols-1 gap-4">
          <div className="lab-card p-5 space-y-2 border-l-4 border-l-[var(--accent-lime)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] text-[var(--accent-lime)]">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-[var(--text-primary)]">Apparent Weightlessness</h3>
                <p className="text-xs font-mono text-[var(--text-secondary)]">0.0g condition experienced during free fall before braking engagement</p>
              </div>
            </div>
          </div>

          <div className="lab-card p-5 space-y-2 border-l-4 border-l-[var(--accent-amber)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] text-[var(--accent-amber)]">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-[var(--text-primary)]">Magnetic Eddy-Current Brakes</h3>
                <p className="text-xs font-mono text-[var(--text-secondary)]">Contactless deceleration produced by Lenz's law electromagnetic induction</p>
              </div>
            </div>
          </div>

          <div className="lab-card p-5 space-y-2 border-l-4 border-l-[var(--accent-cyan)]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] text-[var(--accent-cyan)]">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-display font-bold text-[var(--text-primary)]">Planetary Gravity Fields</h3>
                <p className="text-xs font-mono text-[var(--text-secondary)]">Simulate drops under Earth (1.00g), Moon (0.16g), Mars (0.38g), and Jupiter (2.53g)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Specs Row */}
      <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[var(--text-muted)] gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-lime)]" />
          <span>PHYSICS SIMULATION • 50Hz TELEMETRY SAMPLING</span>
        </div>
        <div>ACTIVE ENVIRONMENT: <span className="text-[var(--text-primary)] font-bold">{celestial.name.toUpperCase()} ({celestial.gravity}g)</span></div>
      </div>

      {/* Exhibit Guide Modal */}
      {showHowItWorks && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="lab-card max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div className="flex items-center gap-2">
                <Compass className="w-5 h-5 text-[var(--accent-cyan)]" />
                <h3 className="text-base font-display font-bold text-[var(--text-primary)]">Exhibit Guide &amp; Physics Overview</h3>
              </div>
              <button
                onClick={() => setShowHowItWorks(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-[var(--text-secondary)] leading-relaxed font-sans">
              <p>
                <strong className="text-[var(--text-primary)]">1. Select Drop Height:</strong> Choose a release height from 10m to 40m. Higher drops result in higher terminal velocity prior to braking.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">2. Gravitational Fields:</strong> Compare drop trajectories across Earth, Moon, Mars, and Jupiter environments.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">3. Simulated Telemetry:</strong> Track altitude, velocity, acceleration, and G-force sampled at 50Hz throughout the drop.
              </p>
              <p>
                <strong className="text-[var(--text-primary)]">4. Magnetic Eddy-Current Braking:</strong> In the lower section of the tower, conductor plates interact with permanent magnets to produce contactless deceleration via Lenz's law.
              </p>
            </div>

            <button
              onClick={() => setShowHowItWorks(false)}
              className="w-full py-3 rounded-xl bg-[var(--accent-primary)] text-white text-xs font-display font-bold hover:brightness-110 cursor-pointer"
            >
              CLOSE GUIDE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
