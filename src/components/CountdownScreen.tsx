import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { CelestialInfo } from '../types';
import { ThreeTowerCanvas } from './ThreeTowerCanvas';
import { soundFx } from '../lib/sound';
import { ShieldAlert, Zap, Activity } from 'lucide-react';

interface CountdownScreenProps {
  height: number;
  celestial: CelestialInfo;
  onCountdownComplete: () => void;
  reducedMotion?: boolean;
}

export const CountdownScreen: React.FC<CountdownScreenProps> = ({
  height,
  celestial,
  onCountdownComplete,
  reducedMotion,
}) => {
  const [count, setCount] = useState<number>(3);
  const hasLaunchedRef = useRef(false);

  useEffect(() => {
    hasLaunchedRef.current = false;
    soundFx.playCountdownBeep(880, false);

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!hasLaunchedRef.current) {
            hasLaunchedRef.current = true;
            soundFx.playCountdownBeep(1760, true);
            setTimeout(() => {
              onCountdownComplete();
            }, 500);
          }
          return 0;
        }
        soundFx.playCountdownBeep(880, false);
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCountdownComplete]);

  return (
    <div className="w-full min-h-[calc(100vh-100px)] py-4 px-2 sm:px-4 flex flex-col justify-between space-y-6 my-auto">
      
      {/* Top HUD Banner */}
      <div className="lab-card p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-l-4 border-l-[var(--accent-amber)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-elevated)] text-[var(--accent-amber)]">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-[var(--accent-amber)] font-bold uppercase tracking-wider block">
              SYSTEM ARMED
            </span>
            <h2 className="text-sm sm:text-base font-display font-bold text-[var(--text-primary)]">
              PRE-DROP COUNTDOWN ({height}M DROP)
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-[var(--text-secondary)]">
          <div>GRAVITY: <span className="text-[var(--accent-lime)] font-bold">{celestial.name} ({celestial.gravity} m/s²)</span></div>
          <div>RELEASE LATCH: <span className="text-[var(--accent-green)] font-bold">ARMED</span></div>
        </div>
      </div>

      {/* Main Center Area: Left 3D View, Right Countdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 my-auto py-2 items-center">
        
        {/* 3D Tower Canvas */}
        <div className="lg:col-span-7 h-[320px] sm:h-[420px] w-full rounded-2xl overflow-hidden border border-[var(--border-subtle)] shadow-xl">
          <ThreeTowerCanvas
            currentHeight={height}
            currentAltitude={height}
            phase="ARMED"
            celestial={celestial}
            reducedMotion={reducedMotion}
          />
        </div>

        {/* Central Cinematic Countdown Card */}
        <div className="lg:col-span-5 lab-card p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden glow-cyan border-[var(--border-highlight)]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--accent-primary)] animate-pulse" />

          <span className="text-xs font-mono text-[var(--accent-cyan)] font-bold tracking-wider uppercase flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[var(--accent-lime)]" /> PREPARING RELEASE LATCH
          </span>

          <motion.div
            key={count}
            initial={reducedMotion ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="my-2"
          >
            {count > 0 ? (
              <span className="text-8xl font-display font-extrabold text-[var(--accent-primary)] tracking-tight">
                {count}
              </span>
            ) : (
              <span className="text-4xl sm:text-5xl font-display font-extrabold text-[var(--accent-green)] tracking-wider animate-bounce">
                FREE FALL!
              </span>
            )}
          </motion.div>

          <p className="text-xs font-mono text-[var(--text-secondary)] max-w-xs">
            Stand clear of drop shaft. Simulated telemetry recording at 50Hz.
          </p>
        </div>
      </div>

      {/* Footer Status Bar */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-mono text-[var(--text-muted)]">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[var(--accent-cyan)] animate-spin" />
          <span>INITIALIZING TELEMETRY STREAM</span>
        </div>
        <div>PRE-DROP PHASE</div>
      </div>
    </div>
  );
};
