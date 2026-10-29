import React, { useEffect, useRef } from 'react';
import { Vec3 } from '../physics/math.ts';
import { DHAKA_GULSHAN2_BUILDINGS } from '../world/dhakaMapData.ts';

interface MinimapRadarProps {
  playerPos: { x: number; z: number };
  playerHeading: number;
  vehiclePos: { x: number; z: number };
  targetPos?: { x: number; z: number };
  isDriving: boolean;
}

export const MinimapRadar: React.FC<MinimapRadarProps> = ({
  playerPos,
  playerHeading,
  vehiclePos,
  targetPos,
  isDriving,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const mapScale = 0.9; // pixels per world meter

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Save for circular clipping
    ctx.save();
    ctx.beginPath();
    ctx.arc(center, center, center - 4, 0, Math.PI * 2);
    ctx.clip();

    // Background radar grid
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, size, size);

    // Grid circles
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    [30, 60, 90].forEach((r) => {
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();
    });

    // World-to-Radar coordinate transformer (centered on player/vehicle)
    const activeX = isDriving ? vehiclePos.x : playerPos.x;
    const activeZ = isDriving ? vehiclePos.z : playerPos.z;

    const toRadar = (wx: number, wz: number) => ({
      x: center + (wx - activeX) * mapScale,
      y: center + (wz - activeZ) * mapScale,
    });

    // Draw Roads (Kamal Ataturk Ave & Gulshan Ave)
    ctx.fillStyle = '#334155';
    // North-South Gulshan Ave
    const r1 = toRadar(-7, -150);
    ctx.fillRect(r1.x, toRadar(0, -150).y, 14 * mapScale, 300 * mapScale);
    // East-West Kamal Ataturk Ave
    const r2 = toRadar(-150, -7);
    ctx.fillRect(toRadar(-150, 0).x, r2.y, 300 * mapScale, 14 * mapScale);

    // Draw Gulshan 2 Roundabout ring
    const roundCenter = toRadar(0, 0);
    ctx.beginPath();
    ctx.arc(roundCenter.x, roundCenter.y, 18 * mapScale, 0, Math.PI * 2);
    ctx.fillStyle = '#334155';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(roundCenter.x, roundCenter.y, 10 * mapScale, 0, Math.PI * 2);
    ctx.fillStyle = '#1e293b';
    ctx.fill();

    // Draw Buildings
    DHAKA_GULSHAN2_BUILDINGS.forEach((b) => {
      const pos = toRadar(b.position.x - b.width / 2, b.position.z - b.depth / 2);
      ctx.fillStyle = '#475569';
      ctx.fillRect(pos.x, pos.y, b.width * mapScale, b.depth * mapScale);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(pos.x, pos.y, b.width * mapScale, b.depth * mapScale);
    });

    // Draw Hero Vehicle Blip (if player is not driving it)
    if (!isDriving) {
      const vPt = toRadar(vehiclePos.x, vehiclePos.z);
      ctx.fillStyle = '#ef4444'; // Red sports car dot
      ctx.beginPath();
      ctx.arc(vPt.x, vPt.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Draw Target Objective Beacon
    if (targetPos) {
      const tPt = toRadar(targetPos.x, targetPos.z);
      ctx.fillStyle = '#f59e0b'; // Amber gold objective dot
      ctx.beginPath();
      ctx.arc(tPt.x, tPt.y, 6.0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Draw Player Arrow at Radar Center
    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(playerHeading);

    ctx.fillStyle = isDriving ? '#38bdf8' : '#22c55e'; // Cyan for car, Green on foot
    ctx.beginPath();
    ctx.moveTo(0, -7);
    ctx.lineTo(5, 6);
    ctx.lineTo(0, 3);
    ctx.lineTo(-5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
    ctx.restore();

    // Outer Radar Bezel
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(center, center, center - 3, 0, Math.PI * 2);
    ctx.stroke();

    // Cardinal Points (N, S, E, W)
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('N', center, 10);
    ctx.fillText('S', center, size - 10);
    ctx.fillText('E', size - 10, center);
    ctx.fillText('W', 10, center);
  }, [playerPos, playerHeading, vehiclePos, targetPos, isDriving]);

  return (
    <div className="relative rounded-full border-2 border-slate-700/80 bg-slate-900/90 shadow-2xl p-1 backdrop-blur-md">
      <canvas
        ref={canvasRef}
        width={160}
        height={160}
        className="rounded-full block"
        aria-label="Dhaka Gulshan 2 Radar Map"
      />
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-800/95 border border-slate-600 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-sky-400 tracking-wider uppercase whitespace-nowrap shadow">
        Gulshan 2
      </div>
    </div>
  );
};
