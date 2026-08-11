import React, { useState, useEffect, useRef } from 'react';
import { ScreenState, CelestialBody, TelemetryDataPoint, SimulationSummary, AccessibilitySettings } from './types';
import { CELESTIAL_BODIES, generateFullTelemetrySeries } from './lib/physics';
import { soundFx } from './lib/sound';

import { HeaderNavigation } from './components/HeaderNavigation';
import { LandingScreen } from './components/LandingScreen';
import { HeightSelectionScreen } from './components/HeightSelectionScreen';
import { CountdownScreen } from './components/CountdownScreen';
import { LiveSimulationScreen } from './components/LiveSimulationScreen';
import { TelemetryDashboardScreen } from './components/TelemetryDashboardScreen';
import { ResultsScreen } from './components/ResultsScreen';

import { SettingsModal } from './components/SettingsModal';

export default function App() {
  // App Navigation & Experiment State
  const [screen, setScreen] = useState<ScreenState>('landing');
  const [selectedHeight, setSelectedHeight] = useState<number>(30);
  const [celestialBodyKey, setCelestialBodyKey] = useState<CelestialBody>('earth');
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryDataPoint[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Accessibility & Display Settings State
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    themeMode: 'dark',
    reducedMotion: false,
    highContrast: false,
    audioEnabled: true,
    screenReaderAlerts: true,
    kioskScale: 'normal',
    language: 'en',
  });

  // Sync theme mode data-theme attribute on <html> element
  useEffect(() => {
    const root = document.documentElement;
    if (accessibility.themeMode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else if (accessibility.themeMode === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      // System mode
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.setAttribute('data-theme', isSystemDark ? 'dark' : 'light');
    }
  }, [accessibility.themeMode]);

  // Sync soundFx enabled status with state
  useEffect(() => {
    soundFx.enabled = accessibility.audioEnabled;
  }, [accessibility.audioEnabled]);

  // Sync high contrast class on HTML root element
  useEffect(() => {
    if (accessibility.highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [accessibility.highContrast]);

  // Inactivity timeout (45 seconds auto-reset to Landing when idle)
  const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

  const resetIdleTimer = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (screen === 'height_select' || screen === 'telemetry' || screen === 'results') {
      idleTimerRef.current = setTimeout(() => {
        setScreen('landing');
      }, 45000); // 45s museum idle timer
    }
  };

  useEffect(() => {
    const handleUserActivity = () => resetIdleTimer();
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    resetIdleTimer();

    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [screen]);

  // Handler methods
  const currentCelestial = CELESTIAL_BODIES[celestialBodyKey];

  const handleStartExperience = () => {
    setScreen('height_select');
  };

  const handleLaunchExperiment = () => {
    setScreen('countdown');
  };

  const handleCountdownFinished = () => {
    setScreen('simulation');
  };

  const handleSimulationFinished = (history: TelemetryDataPoint[]) => {
    setTelemetryHistory(history);
    setScreen('telemetry');
  };

  const handleContinueToResults = () => {
    setScreen('results');
  };

  const handleReplayExperiment = () => {
    setScreen('countdown');
  };

  const handleSelectNewHeight = () => {
    setScreen('height_select');
  };

  const handleResetToHome = () => {
    setScreen('landing');
  };

  // Pre-calculate summary stats for ResultsScreen
  const activeSummary: SimulationSummary = telemetryHistory.length > 0
    ? {
        height: selectedHeight,
        celestial: currentCelestial,
        fallTime: telemetryHistory[telemetryHistory.length - 1].time,
        freeFallDuration: Number((Math.sqrt((2 * selectedHeight * 0.75) / currentCelestial.gravity)).toFixed(2)),
        brakingDuration: Number((telemetryHistory[telemetryHistory.length - 1].time - Math.sqrt((2 * selectedHeight * 0.75) / currentCelestial.gravity)).toFixed(2)),
        maxVelocity: Number(Math.max(...telemetryHistory.map(p => p.velocity)).toFixed(1)),
        maxVelocityKmH: Number((Math.max(...telemetryHistory.map(p => p.velocity)) * 3.6).toFixed(1)),
        peakG: Number(Math.max(...telemetryHistory.map(p => p.gForce)).toFixed(2)),
        avgAcceleration: currentCelestial.gravity,
        impactEnergykJ: Number((0.5 * 80 * Math.pow(Math.max(...telemetryHistory.map(p => p.velocity)), 2) / 1000).toFixed(1)),
        telemetryHistory,
      }
    : generateFullTelemetrySeries(selectedHeight, celestialBodyKey);

  return (
    <div className={`min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col font-sans transition-colors duration-200 ${
      accessibility.kioskScale === 'large' ? 'text-lg' : accessibility.kioskScale === 'kiosk_55' ? 'text-xl' : ''
    }`}>
      
      {/* Museum Header Navigation */}
      <HeaderNavigation
        onOpenSettings={() => setIsSettingsOpen(true)}
        audioEnabled={accessibility.audioEnabled}
        onToggleAudio={() => setAccessibility(prev => ({ ...prev, audioEnabled: !prev.audioEnabled }))}
        onResetExperience={handleResetToHome}
        themeMode={accessibility.themeMode}
        onToggleTheme={() => setAccessibility(prev => ({ ...prev, themeMode: prev.themeMode === 'dark' ? 'light' : 'dark' }))}
      />

      {/* Main View Router Container */}
      <main className="flex-1 w-full flex flex-col items-center justify-center relative p-3 sm:p-6 max-w-7xl mx-auto">
        {screen === 'landing' && (
          <LandingScreen
            onStart={handleStartExperience}
            celestial={currentCelestial}
            reducedMotion={accessibility.reducedMotion}
          />
        )}

        {screen === 'height_select' && (
          <HeightSelectionScreen
            selectedHeight={selectedHeight}
            onSelectHeight={setSelectedHeight}
            celestial={currentCelestial}
            onSelectCelestial={setCelestialBodyKey}
            onLaunch={handleLaunchExperiment}
            onBack={handleResetToHome}
            reducedMotion={accessibility.reducedMotion}
          />
        )}

        {screen === 'countdown' && (
          <CountdownScreen
            onCountdownComplete={handleCountdownFinished}
            height={selectedHeight}
            celestial={currentCelestial}
            reducedMotion={accessibility.reducedMotion}
          />
        )}

        {screen === 'simulation' && (
          <LiveSimulationScreen
            height={selectedHeight}
            celestial={currentCelestial}
            onSimulationComplete={handleSimulationFinished}
            reducedMotion={accessibility.reducedMotion}
          />
        )}

        {screen === 'telemetry' && (
          <TelemetryDashboardScreen
            summary={activeSummary}
            celestial={currentCelestial}
            onContinueToResults={handleContinueToResults}
            onReplay={handleReplayExperiment}
          />
        )}

        {screen === 'results' && (
          <ResultsScreen
            summary={activeSummary}
            onReplay={handleReplayExperiment}
            onSelectNewHeight={handleSelectNewHeight}
            onSelectCelestial={(body) => {
              setCelestialBodyKey(body);
              setScreen('height_select');
            }}
          />
        )}
      </main>

      {/* Settings & Accessibility Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={accessibility}
        onUpdateSettings={setAccessibility}
        onResetExperience={handleResetToHome}
      />
    </div>
  );
}
