import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGulshanDropMission,
  startMission,
  updateMissionTick,
  resetMission,
} from './missions/missionRules.ts';

test('mission initializes in NOT_STARTED status with all objectives incomplete', () => {
  const mission = createGulshanDropMission();
  assert.equal(mission.status, 'NOT_STARTED');
  assert.equal(mission.currentObjectiveIndex, 0);
  assert.ok(mission.objectives.length >= 3);
  assert.equal(mission.objectives[0].completed, false);
});

test('startMission transitions status to ACTIVE', () => {
  const mission = startMission(createGulshanDropMission());
  assert.equal(mission.status, 'ACTIVE');
});

test('updateMissionTick advances objectives when player reaches target waypoint', () => {
  let mission = startMission(createGulshanDropMission());

  // Objective 1 target is (0, 0.5, 0)
  const atObj1 = { x: 0, y: 0.5, z: 0 };
  const step1 = updateMissionTick(mission, atObj1, false, 0.1);

  assert.equal(step1.objectiveCompletedNow, true);
  assert.equal(step1.mission.currentObjectiveIndex, 1);
  assert.equal(step1.mission.objectives[0].completed, true);
});

test('mission fails when time expires', () => {
  let mission = startMission(createGulshanDropMission());
  mission.timeRemaining = 1.0; // 1 second left

  const faraway = { x: 500, y: 0, z: 500 };
  const step = updateMissionTick(mission, faraway, false, 2.0); // 2 seconds pass

  assert.equal(step.mission.status, 'FAILED');
  assert.equal(step.mission.timeRemaining, 0);
});

test('resetMission restores initial clean mission state', () => {
  let mission = startMission(createGulshanDropMission());
  mission.status = 'COMPLETED';

  const reset = resetMission(mission);
  assert.equal(reset.status, 'NOT_STARTED');
  assert.equal(reset.currentObjectiveIndex, 0);
  assert.equal(reset.timeRemaining, 120);
});
