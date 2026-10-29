import React from 'react';

interface SpeedometerProps {
  speedKmh: number;
}

export const Speedometer: React.FC<SpeedometerProps> = ({ speedKmh }) => {
  const displaySpeed = Math.abs(speedKmh);
  const gear = speedKmh < -0.5 ? 'R' : displaySpeed < 1 ? 'P' : 'D';
  const rpmRatio = Math.min(1.0, (displaySpeed % 35) / 35 + 0.15);

  return (
    <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-5 py-3 shadow-2xl backdrop-blur-md flex flex-col items-center min-w-[140px]">
      <div className="flex items-baseline gap-1">
        <span className="font-mono text-4xl font-extrabold text-white tracking-tight">
          {displaySpeed}
        </span>
        <span className="font-mono text-xs font-semibold text-slate-400 uppercase">
          km/h
        </span>
      </div>

      {/* RPM Progress Bar */}
      <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700">
        <div
          className={`h-full transition-all duration-75 rounded-full ${
            rpmRatio > 0.85 ? 'bg-red-500' : rpmRatio > 0.6 ? 'bg-amber-400' : 'bg-sky-400'
          }`}
          style={{ width: `${rpmRatio * 100}%` }}
        />
      </div>

      {/* Gear & Status Indicators */}
      <div className="flex items-center justify-between w-full mt-2 text-xs font-mono">
        <span className="text-slate-400">GEAR</span>
        <span className="bg-sky-500/20 border border-sky-400/40 text-sky-300 font-bold px-2 py-0.5 rounded">
          {gear}
        </span>
      </div>
    </div>
  );
};
