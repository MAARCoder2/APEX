/**
 * Pure Mission State Machine and Rules for Project Apex V2.
 * Solves V1 bug: mission restart bugs, untracked objectives, and missing tests.
 */

import { Vec3, distance } from '../physics/math.ts';

export type MissionStatus = 'NOT_STARTED' | 'ACTIVE' | 'COMPLETED' | 'FAILED';

export interface MissionObjective {
  id: string;
  title: string;
  description: string;
  targetPosition: Vec3;
  targetRadius: number; // meters for trigger
  completed: boolean;
  requiredVehicle?: boolean;
}

export interface MissionData {
  id: string;
  name: string;
  description: string;
  status: MissionStatus;
  currentObjectiveIndex: number;
  objectives: MissionObjective[];
  timeRemaining: number; // seconds (if timed)
  rewardCash: number;
  failureReason?: string;
}

export function createGulshanDropMission(): MissionData {
  return {
    id: 'MSN-01',
    name: 'The Gulshan Delivery',
    description: 'Collect the confidential courier at Gulshan Circle 2, commandeer the sports car, and deliver it to the safehouse on Road 11.',
    status: 'NOT_STARTED',
    currentObjectiveIndex: 0,
    timeRemaining: 120, // 2 minutes
    rewardCash: 2500,
    objectives: [
      {
        id: 'obj-1',
        title: 'Reach Gulshan Circle 2 Roundabout',
        description: 'Meet the courier contact waiting at the central roundabout monument.',
        targetPosition: { x: 0, y: 0.5, z: 0 },
        targetRadius: 6.0,
        completed: false,
      },
      {
        id: 'obj-2',
        title: 'Enter the Sports Car on Kamal Ataturk Ave',
        description: 'Get inside the vehicle parked near the intersection.',
        targetPosition: { x: 22, y: 0.5, z: -8 },
        targetRadius: 4.5,
        completed: false,
        requiredVehicle: true,
      },
      {
        id: 'obj-3',
        title: 'Deliver to Road 11 Safehouse',
        description: 'Drive along Gulshan Avenue to the dropoff marker before time runs out.',
        targetPosition: { x: -65, y: 0.5, z: 58 },
        targetRadius: 7.0,
        completed: false,
        requiredVehicle: true,
      },
    ],
  };
}

export function startMission(mission: MissionData): MissionData {
  return {
    ...mission,
    status: 'ACTIVE',
    currentObjectiveIndex: 0,
    objectives: mission.objectives.map((obj) => ({ ...obj, completed: false })),
  };
}

export function updateMissionTick(
  mission: MissionData,
  playerPosition: Vec3,
  isInVehicle: boolean,
  dt: number
): { mission: MissionData; objectiveCompletedNow: boolean } {
  if (mission.status !== 'ACTIVE') {
    return { mission, objectiveCompletedNow: false };
  }

  const next = {
    ...mission,
    objectives: mission.objectives.map((o) => ({ ...o })),
  };

  // Update timer
  next.timeRemaining -= dt;
  if (next.timeRemaining <= 0) {
    next.timeRemaining = 0;
    next.status = 'FAILED';
    next.failureReason = 'Time limit expired!';
    return { mission: next, objectiveCompletedNow: false };
  }

  const currentObj = next.objectives[next.currentObjectiveIndex];
  if (!currentObj) {
    next.status = 'COMPLETED';
    return { mission: next, objectiveCompletedNow: false };
  }

  const distToTarget = distance(playerPosition, currentObj.targetPosition);

  // Check objective completion
  const satisfiesVehicle = !currentObj.requiredVehicle || isInVehicle;
  if (distToTarget <= currentObj.targetRadius && satisfiesVehicle) {
    currentObj.completed = true;
    next.currentObjectiveIndex += 1;

    // Check if that was the last objective
    if (next.currentObjectiveIndex >= next.objectives.length) {
      next.status = 'COMPLETED';
    }

    return { mission: next, objectiveCompletedNow: true };
  }

  return { mission: next, objectiveCompletedNow: false };
}

export function resetMission(mission: MissionData): MissionData {
  return createGulshanDropMission();
}
