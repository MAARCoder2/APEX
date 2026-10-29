import React, { useState } from 'react';
import { MinimapRadar } from './MinimapRadar.tsx';
import { Speedometer } from './Speedometer.tsx';
import { MissionData } from '../missions/missionRules.ts';
import { soundEffects } from '../audio/soundEffects.ts';
import {
  Car,
  User,
  Volume2,
  VolumeX,
  RotateCcw,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Navigation,
  Compass,
} from 'lucide-react';

interface HUDOverlayProps {
  speedKmh: number;
  isDriving: boolean;
  nearVehicle: boolean;
  mission: MissionData;
  fps: number;
  playerPos: { x: number; z: number };
  playerHeading: number;
  vehiclePos: { x: number; z: number };
  onToggleVehicle: () => void;
  onResetVehicle: () => void;
  onRestartMission: () => void;
  onSetQuality: (quality: 'low' | 'med' | 'high') => void;
}

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  speedKmh,
  isDriving,
  nearVehicle,
  mission,
  fps,
  playerPos,
  playerHeading,
  vehiclePos,
  onToggleVehicle,
  onResetVehicle,
  onRestartMission,
  onSetQuality,
}) => {
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [quality, setQualityState] = useState<'low' | 'med' | 'high'>('high');

  const currentObj = mission.objectives[mission.currentObjectiveIndex];
  const targetPos = currentObj ? { x: currentObj.targetPosition.x, z: currentObj.targetPosition.z } : undefined;

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEffects.setMuted(nextMuted);
  };

  const handleQualityChange = (q: 'low' | 'med' | 'high') => {
    setQualityState(q);
    onSetQuality(q);
  };

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden font-sans">
      {/* ================= TOP LEFT: BRAND & MISSION STATUS ================= */}
      <div className="pointer-events-auto absolute top-4 left-4 flex flex-col gap-2 max-w-sm">
        {/* Brand Badge */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
          <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
          <h1 className="text-xs font-bold font-mono tracking-wider text-slate-100 uppercase">
            Project Apex V2
          </h1>
          <span className="text-[10px] bg-sky-950 border border-sky-600 text-sky-300 font-mono px-1.5 py-0.5 rounded">
            Gulshan 2
          </span>
          <span className="text-[10px] font-mono text-slate-400 ml-auto">{fps} FPS</span>
        </div>

        {/* Mission Card */}
        <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-3.5 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
            <span className="text-[11px] font-mono font-bold tracking-wider text-amber-400 uppercase flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5" />
              {mission.name}
            </span>
            <span className="flex items-center gap-1 font-mono text-xs font-bold text-slate-300">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              {Math.floor(mission.timeRemaining / 60)}:
              {Math.floor(mission.timeRemaining % 60)
                .toString()
                .padStart(2, '0')}
            </span>
          </div>

          {mission.status === 'COMPLETED' ? (
            <div className="bg-emerald-950/80 border border-emerald-600 text-emerald-300 p-2.5 rounded-xl text-xs font-bold text-center">
              Mission Accomplished! +${mission.rewardCash}
            </div>
          ) : mission.status === 'FAILED' ? (
            <div className="bg-red-950/80 border border-red-600 text-red-300 p-2.5 rounded-xl text-xs font-bold text-center">
              Mission Failed: {mission.failureReason || 'Time expired'}
            </div>
          ) : currentObj ? (
            <div>
              <p className="text-xs font-semibold text-slate-100 leading-snug">{currentObj.title}</p>
              <p className="text-[11px] text-slate-400 mt-1 leading-normal">{currentObj.description}</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* ================= TOP RIGHT: STATS & WANTED LEVEL ================= */}
      <div className="pointer-events-auto absolute top-4 right-4 flex items-center gap-3">
        {/* Mode Pill */}
        <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-2 text-xs font-mono font-bold text-slate-200">
          {isDriving ? (
            <>
              <Car className="w-4 h-4 text-sky-400" />
              <span>DRIVING</span>
            </>
          ) : (
            <>
              <User className="w-4 h-4 text-emerald-400" />
              <span>ON FOOT</span>
            </>
          )}
        </div>

        {/* Cash Counter */}
        <div className="bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
          <Award className="w-3.5 h-3.5" />
          <span>$2,500</span>
        </div>
      </div>

      {/* ================= CENTER: PROXIMITY ACTION PROMPT ================= */}
      {(nearVehicle && !isDriving) || (isDriving && speedKmh < 12) ? (
        <div className="pointer-events-auto absolute top-2/3 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900/95 border-2 border-sky-400 px-5 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
          <kbd className="bg-sky-500 text-slate-950 font-mono font-extrabold text-sm px-2.5 py-1 rounded-lg shadow">
            E
          </kbd>
          <span className="text-xs font-bold text-slate-100">
            {isDriving ? 'Exit Sports Car' : 'Enter Sports Car'}
          </span>
        </div>
      ) : null}

      {/* ================= BOTTOM LEFT: RADAR MINIMAP ================= */}
      <div className="pointer-events-auto absolute bottom-6 left-6">
        <MinimapRadar
          playerPos={playerPos}
          playerHeading={playerHeading}
          vehiclePos={vehiclePos}
          targetPos={targetPos}
          isDriving={isDriving}
        />
      </div>

      {/* ================= BOTTOM RIGHT: SPEEDOMETER (WHEN DRIVING) ================= */}
      {isDriving && (
        <div className="pointer-events-auto absolute bottom-6 right-6">
          <Speedometer speedKmh={speedKmh} />
        </div>
      )}

      {/* ================= BOTTOM CENTER: CONSOLIDATED COLLAPSIBLE DOCK ================= */}
      <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center">
        {/* Toggle Button */}
        <button
          onClick={() => setIsDockCollapsed(!isDockCollapsed)}
          className="mb-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase flex items-center gap-1 shadow-lg backdrop-blur-md cursor-pointer transition-colors"
          aria-label={isDockCollapsed ? 'Show Controls' : 'Hide Controls'}
        >
          {isDockCollapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {isDockCollapsed ? 'Show Controls' : 'Zen View'}
        </button>

        {/* Control Pill Dock */}
        {!isDockCollapsed && (
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3">
            {/* Enter/Exit Vehicle Button */}
            <button
              onClick={onToggleVehicle}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDriving
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>{isDriving ? 'Exit Car' : 'Enter Car'}</span>
            </button>

            {/* Horn Button (Driving) */}
            {isDriving && (
              <button
                onClick={() => soundEffects.playHorn()}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
              >
                Horn (H)
              </button>
            )}

            {/* Reset Car */}
            {isDriving && (
              <button
                onClick={onResetVehicle}
                title="Reset Car Upright"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 p-2 rounded-xl text-xs cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Mission Restart */}
            <button
              onClick={onRestartMission}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              Restart Mission
            </button>

            {/* Quality Selector */}
            <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700">
              {(['low', 'med', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-mono uppercase font-bold cursor-pointer transition-colors ${
                    quality === q ? 'bg-sky-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Mute Audio Toggle */}
            <button
              onClick={toggleMute}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-2 rounded-xl text-xs cursor-pointer transition-colors"
              aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-sky-400" />}
            </button>

            {/* Help Button */}
            <button
              onClick={() => setShowHelp(true)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 p-2 rounded-xl text-xs cursor-pointer transition-colors"
              aria-label="Controls Guide"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ================= HELP & CONTROLS MODAL ================= */}
      {showHelp && (
        <div className="pointer-events-auto absolute inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h2 className="text-base font-bold font-mono tracking-wide flex items-center gap-2">
                <Compass className="w-5 h-5 text-sky-400" />
                CONTROLS CHEAT-SHEET
              </h2>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h3 className="font-bold text-sky-400 mb-1.5 uppercase font-mono">On Foot</h3>
                <div className="grid grid-cols-2 gap-1.5 text-slate-300">
                  <span>W / A / S / D : Move</span>
                  <span>Shift : Sprint</span>
                  <span>Space : Jump</span>
                  <span>Mouse : Orbit Camera</span>
                  <span>E or F : Enter Car</span>
                  <span>Pointer Drag : Look Around</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-amber-400 mb-1.5 uppercase font-mono">Driving Sports Car</h3>
                <div className="grid grid-cols-2 gap-1.5 text-slate-300">
                  <span>W : Throttle</span>
                  <span>S : Brake / Reverse</span>
                  <span>A / D : Steer</span>
                  <span>Space : Handbrake</span>
                  <span>E or F : Exit Car</span>
                  <span>H : Horn</span>
                  <span>R : Reset Car Upright</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold py-2 rounded-xl cursor-pointer transition-colors"
            >
              Back to Game
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
