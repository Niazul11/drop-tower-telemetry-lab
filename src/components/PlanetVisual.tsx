import React from 'react';
import { CelestialBody } from '../types';

interface PlanetVisualProps {
  id: CelestialBody;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
}

export const PlanetVisual: React.FC<PlanetVisualProps> = ({ id, size = 'md', isSelected = false }) => {
  const dimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-14 h-14' : 'w-10 h-10 sm:w-12 sm:h-12';

  if (id === 'earth') {
    return (
      <div className={`relative ${dimensions} rounded-full overflow-hidden shrink-0 transition-transform duration-300 ${isSelected ? 'scale-105 shadow-md shadow-sky-500/30 ring-2 ring-sky-400/50' : 'opacity-90'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <radialGradient id="earthBase" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#0284C7" />
              <stop offset="85%" stopColor="#0F172A" />
            </radialGradient>
            <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="transparent" />
              <stop offset="98%" stopColor="#38BDF8" stopOpacity="0.6" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          {/* Ocean Base */}
          <circle cx="50" cy="50" r="46" fill="url(#earthBase)" />
          {/* Continents (North & South America, Europe/Africa) */}
          <path
            d="M 28 30 C 35 22 48 20 54 28 C 58 34 50 42 42 45 C 36 47 28 40 28 30 Z"
            fill="#10B981"
            opacity="0.9"
          />
          <path
            d="M 52 42 C 60 38 72 40 76 52 C 78 62 68 70 58 68 C 50 66 48 54 52 42 Z"
            fill="#059669"
            opacity="0.85"
          />
          <path
            d="M 32 58 C 38 56 42 62 40 72 C 38 78 30 76 28 68 Z"
            fill="#047857"
            opacity="0.8"
          />
          {/* Swirling Clouds */}
          <path
            d="M 15 40 Q 35 30 55 45 T 85 35"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5"
            strokeLinecap="round"
            opacity="0.45"
          />
          <path
            d="M 25 65 Q 45 55 65 70 T 80 60"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.4"
          />
          {/* Atmosphere Glow */}
          <circle cx="50" cy="50" r="46" fill="url(#earthGlow)" />
        </svg>
      </div>
    );
  }

  if (id === 'moon') {
    return (
      <div className={`relative ${dimensions} rounded-full overflow-hidden shrink-0 transition-transform duration-300 ${isSelected ? 'scale-105 shadow-md shadow-slate-400/30 ring-2 ring-slate-300/50' : 'opacity-90'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <radialGradient id="moonBase" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="50%" stopColor="#94A3B8" />
              <stop offset="90%" stopColor="#1E293B" />
            </radialGradient>
          </defs>
          {/* Lunar Base */}
          <circle cx="50" cy="50" r="46" fill="url(#moonBase)" />
          {/* Maria & Craters */}
          <circle cx="36" cy="36" r="11" fill="#64748B" opacity="0.6" />
          <circle cx="62" cy="42" r="14" fill="#475569" opacity="0.55" />
          <circle cx="48" cy="66" r="10" fill="#475569" opacity="0.5" />
          <circle cx="28" cy="62" r="7" fill="#334155" opacity="0.5" />
          {/* Small Crisp Impact Craters */}
          <circle cx="42" cy="28" r="4" fill="#CBD5E1" stroke="#475569" strokeWidth="1" opacity="0.8" />
          <circle cx="68" cy="68" r="5" fill="#CBD5E1" stroke="#475569" strokeWidth="1" opacity="0.8" />
          <circle cx="22" cy="44" r="3" fill="#E2E8F0" opacity="0.9" />
        </svg>
      </div>
    );
  }

  if (id === 'mars') {
    return (
      <div className={`relative ${dimensions} rounded-full overflow-hidden shrink-0 transition-transform duration-300 ${isSelected ? 'scale-105 shadow-md shadow-orange-500/30 ring-2 ring-orange-400/50' : 'opacity-90'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <radialGradient id="marsBase" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FB923C" />
              <stop offset="45%" stopColor="#EA580C" />
              <stop offset="90%" stopColor="#451A03" />
            </radialGradient>
            <radialGradient id="marsGlow" cx="50%" cy="50%" r="50%">
              <stop offset="70%" stopColor="transparent" />
              <stop offset="98%" stopColor="#FB923C" stopOpacity="0.5" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>
          {/* Rust Base */}
          <circle cx="50" cy="50" r="46" fill="url(#marsBase)" />
          {/* Valles Marineris & Dark Basalt Terrains */}
          <path
            d="M 22 48 Q 50 42 78 52 Q 55 58 22 48 Z"
            fill="#7C2D12"
            opacity="0.8"
          />
          <circle cx="38" cy="32" r="12" fill="#9A3412" opacity="0.7" />
          <circle cx="66" cy="62" r="10" fill="#7C2D12" opacity="0.75" />
          {/* North Polar Ice Cap */}
          <ellipse cx="50" cy="10" rx="18" ry="6" fill="#F8FAFC" opacity="0.9" />
          {/* South Ice Cap */}
          <ellipse cx="50" cy="90" rx="14" ry="5" fill="#F8FAFC" opacity="0.8" />
          {/* Atmosphere Glow */}
          <circle cx="50" cy="50" r="46" fill="url(#marsGlow)" />
        </svg>
      </div>
    );
  }

  if (id === 'jupiter') {
    return (
      <div className={`relative ${dimensions} rounded-full overflow-hidden shrink-0 transition-transform duration-300 ${isSelected ? 'scale-105 shadow-md shadow-amber-500/30 ring-2 ring-amber-400/50' : 'opacity-90'}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <radialGradient id="jupiterBase" cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="40%" stopColor="#D97706" />
              <stop offset="85%" stopColor="#451A03" />
            </radialGradient>
            <linearGradient id="jupiterBands" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#78350F" stopOpacity="0.6" />
              <stop offset="20%" stopColor="#F59E0B" stopOpacity="0.4" />
              <stop offset="35%" stopColor="#B45309" stopOpacity="0.7" />
              <stop offset="55%" stopColor="#FEF3C7" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#92400E" stopOpacity="0.8" />
              <stop offset="85%" stopColor="#D97706" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#451A03" stopOpacity="0.7" />
            </linearGradient>
          </defs>
          {/* Base */}
          <circle cx="50" cy="50" r="46" fill="url(#jupiterBase)" />
          {/* Cloud Bands */}
          <rect x="4" y="10" width="92" height="80" fill="url(#jupiterBands)" mask="url(#planetMask)" />
          {/* Great Red Spot */}
          <ellipse cx="68" cy="62" rx="11" ry="8" fill="#DC2626" opacity="0.9" />
          <ellipse cx="68" cy="62" rx="7" ry="5" fill="#EF4444" opacity="0.95" />
        </svg>
      </div>
    );
  }

  return null;
};
