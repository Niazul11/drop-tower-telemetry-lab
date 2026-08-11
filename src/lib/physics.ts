import { CelestialBody, CelestialInfo, SimulationSummary, TelemetryDataPoint } from '../types';

export const CELESTIAL_BODIES: Record<CelestialBody, CelestialInfo> = {
  earth: {
    id: 'earth',
    name: 'Earth',
    gravity: 9.81,
    gRatio: 1.0,
    color: '#00A4EF',
    description: 'Standard Earth gravity (1.00g). Baseline environment for human sensation.',
    surfaceType: 'Museum Launch Pad (Sea Level)',
    skyColor: '#1B1B1C',
  },
  moon: {
    id: 'moon',
    name: 'Moon',
    gravity: 1.62,
    gRatio: 0.165,
    color: '#D2D2D2',
    description: 'Lunar gravity (0.165g). Extended float time with low acceleration.',
    surfaceType: 'Regolith Lunar Outpost Base',
    skyColor: '#0F0F10',
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    gravity: 3.72,
    gRatio: 0.379,
    color: '#FF8C00',
    description: 'Martian gravity (0.38g). Moderate acceleration in thin CO2 atmosphere.',
    surfaceType: 'Olympus Mons Research Dome',
    skyColor: '#19120C',
  },
  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    gravity: 24.79,
    gRatio: 2.527,
    color: '#00CC6A',
    description: 'Hyper-gravity cloud tops (2.53g). Intense drop with high magnetic braking load.',
    surfaceType: 'Orbital Floating Telemetry Station',
    skyColor: '#121C16',
  },
};

export const AVAILABLE_HEIGHTS = [10, 20, 30, 40]; // meters

/**
 * Calculates physics predictions for height and celestial body
 */
export function calculatePhysicsPreview(height: number, bodyKey: CelestialBody = 'earth') {
  const celestial = CELESTIAL_BODIES[bodyKey];
  const g = celestial.gravity;
  
  // Free fall occupies top 75% of height, magnetic braking occupies bottom 25%
  const freeFallDist = height * 0.75;
  const brakingDist = height * 0.25;
  
  const freeFallTime = Math.sqrt((2 * freeFallDist) / g);
  const maxVelocity = g * freeFallTime; // m/s
  const maxVelocityKmH = maxVelocity * 3.6; // km/h
  
  // Deceleration during braking: a = v^2 / (2 * brakingDist)
  const brakeDeceleration = (maxVelocity * maxVelocity) / (2 * brakingDist);
  const brakingTime = maxVelocity / brakeDeceleration;
  
  const totalFallTime = freeFallTime + brakingTime;
  
  // Felt G-force during magnetic braking = 1.0 + (deceleration / g_earth)
  const peakG = 1.0 + (brakeDeceleration / 9.81);
  
  // Kinetic energy for standard 80kg capsule payload: E_k = 0.5 * m * v^2
  const payloadMass = 80; // kg
  const impactEnergykJ = (0.5 * payloadMass * maxVelocity * maxVelocity) / 1000;

  return {
    celestial,
    height,
    freeFallTime,
    brakingTime,
    totalFallTime,
    maxVelocity,
    maxVelocityKmH,
    brakeDeceleration,
    peakG,
    impactEnergykJ,
  };
}

/**
 * Generates high-frequency time-series telemetry data for the entire drop.
 */
export function generateFullTelemetrySeries(height: number, bodyKey: CelestialBody = 'earth'): SimulationSummary {
  const preview = calculatePhysicsPreview(height, bodyKey);
  const g = preview.celestial.gravity;
  const { freeFallTime, brakingTime, totalFallTime, maxVelocity, peakG, impactEnergykJ } = preview;
  
  const points: TelemetryDataPoint[] = [];
  const dt = 0.02; // 50 samples per second
  const freeFallDist = height * 0.75;
  const brakingDist = height * 0.25;
  const brakeDecel = (maxVelocity * maxVelocity) / (2 * brakingDist);

  let t = 0;

  // Initial Armed State point
  points.push({
    time: 0,
    altitude: height,
    velocity: 0,
    acceleration: 0,
    gForce: 1.0 * preview.celestial.gRatio,
    apparentWeightlessness: 0,
    phase: 'ARMED',
  });

  // Free fall phase
  while (t <= freeFallTime) {
    t += dt;
    const currentT = Math.min(t, freeFallTime);
    const alt = Math.max(brakingDist, height - 0.5 * g * currentT * currentT);
    const vel = g * currentT;
    const accel = g;
    // During free fall in capsule frame: felt weight = 0g (true weightlessness)
    const gF = 0.0;
    const weightlessness = 100;

    points.push({
      time: Number(currentT.toFixed(3)),
      altitude: Number(alt.toFixed(2)),
      velocity: Number(vel.toFixed(2)),
      acceleration: Number(accel.toFixed(2)),
      gForce: Number(gF.toFixed(2)),
      apparentWeightlessness: weightlessness,
      phase: 'FREE_FALL',
    });
  }

  // Magnetic Braking phase
  let tBrake = 0;
  while (tBrake <= brakingTime) {
    tBrake += dt;
    const currentTBrake = Math.min(tBrake, brakingTime);
    const overallT = freeFallTime + currentTBrake;
    
    // v(t) = maxVelocity - brakeDecel * t
    const vel = Math.max(0, maxVelocity - brakeDecel * currentTBrake);
    // h(t) = brakingDist - (maxVelocity * t - 0.5 * brakeDecel * t^2)
    const alt = Math.max(0, brakingDist - (maxVelocity * currentTBrake - 0.5 * brakeDecel * currentTBrake * currentTBrake));
    
    // Smooth magnetic braking curve ramping up then down
    const brakeRatio = Math.sin((currentTBrake / brakingTime) * Math.PI);
    const currentG = 1.0 + (brakeDecel / 9.81) * (0.6 + 0.8 * brakeRatio);
    
    points.push({
      time: Number(overallT.toFixed(3)),
      altitude: Number(alt.toFixed(2)),
      velocity: Number(vel.toFixed(2)),
      acceleration: Number((-brakeDecel).toFixed(2)),
      gForce: Number(currentG.toFixed(2)),
      apparentWeightlessness: 0,
      phase: 'BRAKING',
    });
  }

  // Final Safe Landing point
  points.push({
    time: Number((totalFallTime + 0.1).toFixed(3)),
    altitude: 0,
    velocity: 0,
    acceleration: 0,
    gForce: 1.0 * preview.celestial.gRatio,
    apparentWeightlessness: 0,
    phase: 'SAFE',
  });

  return {
    height,
    celestial: preview.celestial,
    fallTime: Number(totalFallTime.toFixed(2)),
    freeFallDuration: Number(freeFallTime.toFixed(2)),
    brakingDuration: Number(brakingTime.toFixed(2)),
    maxVelocity: Number(maxVelocity.toFixed(1)),
    maxVelocityKmH: Number((maxVelocity * 3.6).toFixed(1)),
    peakG: Number(peakG.toFixed(2)),
    avgAcceleration: Number(g.toFixed(2)),
    impactEnergykJ: Number(impactEnergykJ.toFixed(1)),
    telemetryHistory: points,
  };
}
