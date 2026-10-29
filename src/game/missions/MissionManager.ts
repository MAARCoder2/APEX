/**
 * In-World Mission Manager & Visual Objective Beacon for Project Apex V2.
 * Adheres to Three.js design guidelines: 3D illuminated beacon & pulsing ring,
 * audio feedback, and clean state machine synchronization.
 */

import * as THREE from 'three';
import {
  MissionData,
  createGulshanDropMission,
  startMission,
  updateMissionTick,
  resetMission,
} from './missionRules.ts';
import { Vec3 } from '../physics/math.ts';
import { soundEffects } from '../audio/soundEffects.ts';

export class MissionManager {
  public group: THREE.Group;
  public mission: MissionData;

  // 3D Visual Beacon objects
  private beaconBeam: THREE.Mesh | null = null;
  private beaconRing: THREE.Mesh | null = null;
  private beaconLight: THREE.PointLight | null = null;
  private pulseTime: number = 0;

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'MissionVisualBeacons';
    this.mission = createGulshanDropMission();
  }

  public init(scene: THREE.Scene): void {
    // 1. Vertical illuminated beacon beam (transparent column)
    const beamGeo = new THREE.CylinderGeometry(0.3, 0.3, 30, 16);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
    });
    this.beaconBeam = new THREE.Mesh(beamGeo, beamMat);
    this.beaconBeam.position.y = 15;
    this.group.add(this.beaconBeam);

    // 2. Pulsing ground target ring
    const ringGeo = new THREE.RingGeometry(3.0, 3.6, 32);
    ringGeo.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
    });
    this.beaconRing = new THREE.Mesh(ringGeo, ringMat);
    this.beaconRing.position.y = 0.08;
    this.group.add(this.beaconRing);

    // 3. Ambient point light at beacon target
    this.beaconLight = new THREE.PointLight(0x38bdf8, 3.0, 15);
    this.beaconLight.position.y = 2.0;
    this.group.add(this.beaconLight);

    scene.add(this.group);
    this.updateBeaconPosition();
  }

  public start(): void {
    this.mission = startMission(this.mission);
    this.updateBeaconPosition();
    soundEffects.playObjectiveComplete();
  }

  public reset(): void {
    this.mission = resetMission(this.mission);
    this.updateBeaconPosition();
  }

  public update(dt: number, playerPos: Vec3, isInVehicle: boolean): void {
    if (this.mission.status !== 'ACTIVE') {
      this.group.visible = false;
      return;
    }

    this.group.visible = true;

    // Pulse animation
    this.pulseTime += dt * 3.0;
    const pulseScale = 1.0 + Math.sin(this.pulseTime) * 0.15;
    if (this.beaconRing) {
      this.beaconRing.scale.set(pulseScale, 1.0, pulseScale);
    }

    // Step mission tick
    const result = updateMissionTick(this.mission, playerPos, isInVehicle, dt);
    this.mission = result.mission;

    if (result.objectiveCompletedNow) {
      soundEffects.playObjectiveComplete();
      this.updateBeaconPosition();
    }
  }

  private updateBeaconPosition(): void {
    const currentObj = this.mission.objectives[this.mission.currentObjectiveIndex];
    if (currentObj && this.mission.status === 'ACTIVE') {
      const pos = currentObj.targetPosition;
      this.group.position.set(pos.x, 0, pos.z);

      // Change beacon color for vehicle requirements
      const color = currentObj.requiredVehicle ? 0xf59e0b : 0x38bdf8;
      if (this.beaconBeam) {
        (this.beaconBeam.material as THREE.MeshBasicMaterial).color.setHex(color);
      }
      if (this.beaconRing) {
        (this.beaconRing.material as THREE.MeshBasicMaterial).color.setHex(color);
      }
      if (this.beaconLight) {
        this.beaconLight.color.setHex(color);
      }
    } else {
      this.group.visible = false;
    }
  }

  public dispose(): void {
    if (this.beaconBeam) {
      this.beaconBeam.geometry.dispose();
      (this.beaconBeam.material as THREE.Material).dispose();
    }
    if (this.beaconRing) {
      this.beaconRing.geometry.dispose();
      (this.beaconRing.material as THREE.Material).dispose();
    }
  }
}
