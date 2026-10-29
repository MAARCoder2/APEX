import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createInitialVehicleState,
  stepVehicleKinematics,
  DEFAULT_SPORTS_CAR_CONFIG,
  VehicleInput,
} from './physics/vehicleKinematics.ts';

test('vehicle accelerates forward from rest when throttle is applied', () => {
  const state = createInitialVehicleState();
  const input: VehicleInput = {
    throttle: 1.0,
    brake: 0,
    steer: 0,
    handbrake: false,
    reverse: false,
  };

  const next = stepVehicleKinematics(state, input, DEFAULT_SPORTS_CAR_CONFIG, 0.1);
  assert.ok(next.speed > 0, 'speed should be positive');
  assert.ok(next.position.z < 0, 'position should move forward in -Z direction');
});

test('vehicle brakes decelerate speed smoothly without overshoot', () => {
  const state = createInitialVehicleState();
  state.speed = 20.0; // 20 m/s

  const brakeInput: VehicleInput = {
    throttle: 0,
    brake: 1.0,
    steer: 0,
    handbrake: false,
    reverse: false,
  };

  const next = stepVehicleKinematics(state, brakeInput, DEFAULT_SPORTS_CAR_CONFIG, 0.5);
  assert.ok(next.speed < 20.0, 'speed should decrease');
  assert.ok(next.speed >= 0, 'speed should not become negative from standard forward braking');
});

test('reverse input decelerates forward motion first, then accelerates backward', () => {
  const movingForward = createInitialVehicleState();
  movingForward.speed = 10.0;

  const reverseInput: VehicleInput = {
    throttle: 0,
    brake: 0,
    steer: 0,
    handbrake: false,
    reverse: true,
  };

  // First step: should brake forward motion
  const step1 = stepVehicleKinematics(movingForward, reverseInput, DEFAULT_SPORTS_CAR_CONFIG, 0.2);
  assert.ok(step1.speed < 10.0, 'speed should reduce when reversing while rolling forward');

  // Next step from stationary: should accelerate into negative speed (reverse)
  const stopped = createInitialVehicleState();
  stopped.speed = 0;
  const step2 = stepVehicleKinematics(stopped, reverseInput, DEFAULT_SPORTS_CAR_CONFIG, 0.2);
  assert.ok(step2.speed < 0, 'stationary car should accelerate backwards under reverse input');
});

test('speed-sensitive steering reduces max steering angle at high speeds for stability', () => {
  const lowSpeedState = createInitialVehicleState();
  lowSpeedState.speed = 2.0;

  const highSpeedState = createInitialVehicleState();
  highSpeedState.speed = 35.0;

  const fullRightInput: VehicleInput = {
    throttle: 0.5,
    brake: 0,
    steer: 1.0,
    handbrake: false,
    reverse: false,
  };

  const nextLow = stepVehicleKinematics(lowSpeedState, fullRightInput, DEFAULT_SPORTS_CAR_CONFIG, 1.0);
  const nextHigh = stepVehicleKinematics(highSpeedState, fullRightInput, DEFAULT_SPORTS_CAR_CONFIG, 1.0);

  assert.ok(nextLow.steerAngle > nextHigh.steerAngle, 'high speed steering angle should be dampened compared to low speed');
});
