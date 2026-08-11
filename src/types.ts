export type ScreenState = 
  | 'landing' 
  | 'height_select' 
  | 'countdown' 
  | 'simulation' 
  | 'telemetry' 
  | 'results';

export type CelestialBody = 'earth' | 'moon' | 'mars' | 'jupiter';

export interface CelestialInfo {
  id: CelestialBody;
  name: string;
  gravity: number; // m/s^2
  gRatio: number; // relative to Earth 1g
  color: string;
  description: string;
  surfaceType: string;
  skyColor: string;
}

export type SimulationPhase = 'ARMED' | 'FREE_FALL' | 'BRAKING' | 'SAFE';

export interface TelemetryDataPoint {
  time: number; // seconds
  altitude: number; // meters
  velocity: number; // m/s
  acceleration: number; // m/s^2
  gForce: number; // g
  apparentWeightlessness: number; // % (100% during freefall)
  phase: SimulationPhase;
}

export interface SimulationSummary {
  height: number; // 10, 20, 30, 40
  celestial: CelestialInfo;
  fallTime: number; // s
  freeFallDuration: number; // s
  brakingDuration: number; // s
  maxVelocity: number; // m/s
  maxVelocityKmH: number; // km/h
  peakG: number; // g
  avgAcceleration: number; // m/s^2
  impactEnergykJ: number; // kJ
  telemetryHistory: TelemetryDataPoint[];
}

export interface AccessibilitySettings {
  themeMode: 'system' | 'dark' | 'light';
  reducedMotion: boolean;
  highContrast: boolean;
  audioEnabled: boolean;
  screenReaderAlerts: boolean;
  kioskScale: 'normal' | 'large' | 'kiosk_55';
  language: 'en' | 'es' | 'fr' | 'zh';
}
