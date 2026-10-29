/**
 * Project Apex V2 — Main App Entry Component
 * Adheres to Three.js and Ultra-mode guidelines:
 * - Mounts WebGLRenderer in dedicated container ref once.
 * - Stores callbacks and mutable references in refs so React state updates
 *   never tear down the canvas or reset simulation state.
 * - Supports ?autostart=1 to bypass splash screen.
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine.ts';
import { HUDOverlay } from './game/ui/HUDOverlay.tsx';
import { MissionData, createGulshanDropMission } from './game/missions/missionRules.ts';
import { Play, Compass, ShieldCheck, MapPin } from 'lucide-react';

export default function App() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // Check ?autostart=1
  const isAutoStart = new URLSearchParams(window.location.search).get('autostart') === '1';

  // HUD State (buffered to prevent 60Hz rerenders)
  const [isPlaying, setIsPlaying] = useState<boolean>(isAutoStart);
  const [speedKmh, setSpeedKmh] = useState<number>(0);
  const [isDriving, setIsDriving] = useState<boolean>(false);
  const [nearVehicle, setNearVehicle] = useState<boolean>(false);
  const [mission, setMission] = useState<MissionData>(createGulshanDropMission());
  const [fps, setFps] = useState<number>(60);

  // High-frequency throttle refs
  const lastSpeedUpdate = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying || !mountRef.current || engineRef.current) return;

    const engine = new GameEngine(mountRef.current, {
      onSpeedChange: (speed) => {
        const now = performance.now();
        if (now - lastSpeedUpdate.current > 60) {
          setSpeedKmh(speed);
          lastSpeedUpdate.current = now;
        }
      },
      onModeChange: (driving) => {
        setIsDriving(driving);
      },
      onMissionUpdate: (m) => {
        setMission({ ...m });
      },
      onNearVehicleChange: (near) => {
        setNearVehicle(near);
      },
      onFpsUpdate: (currentFps) => {
        setFps(currentFps);
      },
    });

    engineRef.current = engine;

    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
        engineRef.current = null;
      }
    };
  }, [isPlaying]);

  const handleStartGame = () => {
    setIsPlaying(true);
  };

  const handleToggleVehicle = () => {
    if (engineRef.current) {
      engineRef.current.toggleVehicleEntry();
    }
  };

  const handleResetVehicle = () => {
    if (engineRef.current) {
      engineRef.current.resetVehicle();
    }
  };

  const handleRestartMission = () => {
    if (engineRef.current) {
      engineRef.current.missions.reset();
      engineRef.current.missions.start();
    }
  };

  const handleSetQuality = (quality: 'low' | 'med' | 'high') => {
    if (engineRef.current) {
      engineRef.current.setQuality(quality);
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none"
      data-state={isPlaying ? 'playing' : 'title'}
    >
      {/* 3D Canvas Mount (Isolated from React DOM updates) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full" data-testid="game-canvas-mount" />

      {/* Start / Splash Screen */}
      {!isPlaying && (
        <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50">
          <div className="max-w-lg w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center">
            {/* Title Badge */}
            <div className="inline-flex items-center gap-2 bg-sky-500/10 border border-sky-400/30 px-3 py-1 rounded-full text-xs font-mono font-bold text-sky-400 tracking-wider uppercase mb-4">
              <Compass className="w-3.5 h-3.5" />
              Dhaka Open-World 3D
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2 font-mono">
              PROJECT APEX V2
            </h1>

            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Explore the streets of Dhaka's Gulshan-2 commercial district. Control a humanoid courier, commandeer high-speed vehicles, and navigate urban traffic.
            </p>

            {/* Feature Highlights */}
            <div className="grid grid-cols-2 gap-3 w-full text-left mb-6">
              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold text-slate-200">Gulshan Circle 2</h2>
                  <p className="text-[11px] text-slate-400">Kamal Ataturk Ave & authentic Bengali landmarks.</p>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 p-3 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-xs font-bold text-slate-200">Physics & Kinematics</h2>
                  <p className="text-[11px] text-slate-400">Skeletal locomotion, sports car driving, and audio.</p>
                </div>
              </div>
            </div>

            {/* Launch Button */}
            <button
              onClick={handleStartGame}
              className="w-full bg-sky-500 hover:bg-sky-400 active:scale-[0.98] text-slate-950 font-bold py-3.5 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/20 cursor-pointer transition-all"
              aria-label="Start Game"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Enter Dhaka District</span>
            </button>

            <span className="text-[11px] text-slate-400 mt-4 font-mono">
              Desktop Keyboard & Mouse Supported
            </span>
          </div>
        </div>
      )}

      {/* Active In-Game HUD Overlay */}
      {isPlaying && (
        <HUDOverlay
          speedKmh={speedKmh}
          isDriving={isDriving}
          nearVehicle={nearVehicle}
          mission={mission}
          fps={fps}
          playerPos={
            engineRef.current
              ? { x: engineRef.current.player.position.x, z: engineRef.current.player.position.z }
              : { x: 0, z: 8 }
          }
          playerHeading={engineRef.current ? engineRef.current.player.rotationY : 0}
          vehiclePos={
            engineRef.current
              ? {
                  x: engineRef.current.vehicle.state.position.x,
                  z: engineRef.current.vehicle.state.position.z,
                }
              : { x: 22, z: -8 }
          }
          onToggleVehicle={handleToggleVehicle}
          onResetVehicle={handleResetVehicle}
          onRestartMission={handleRestartMission}
          onSetQuality={handleSetQuality}
        />
      )}
    </div>
  );
}
