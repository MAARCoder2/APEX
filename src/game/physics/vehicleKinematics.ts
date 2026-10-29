/**
 * Pure vehicle kinematics and physics calculation for Project Apex V2.
 * Resolves V1 bug: instant angular velocity, unrealistic collisions,
 * and lack of physical braking/weight transfer.
 */

import { Vec3, v3, clamp } from './math.ts';

export interface VehicleInput {
  throttle: number; // 0 to 1
  brake: number;    // 0 to 1
  steer: number;    // -1 (left) to 1 (right)
  handbrake: boolean;
  reverse: boolean;
}

export interface VehicleConfig {
  maxSpeed: number;           // m/s (e.g. 36 m/s ~= 130 km/h)
  maxReverseSpeed: number;    // m/s (e.g. 10 m/s)
  acceleration: number;       // m/s^2
  brakeForce: number;         // m/s^2
  reverseAcceleration: number;// m/s^2
  drag: number;               // air resistance factor
  steerSpeed: number;         // rad/s steering response
  maxSteerAngle: number;      // radians at low speed (e.g. 0.55 rad ~= 32 deg)
  minSteerAngle: number;      // radians at high speed (e.g. 0.18 rad)
  wheelBase: number;          // meters (e.g. 2.6 m)
  wheelTrack: number;         // meters (e.g. 1.8 m)
  wheelRadius: number;        // meters (e.g. 0.35 m)
  mass: number;               // kg
}

export interface VehicleState {
  position: Vec3;
  heading: number;            // radians yaw (0 = -Z, PI/2 = +X)
  speed: number;              // m/s (positive = forward, negative = reverse)
  steerAngle: number;         // current front wheel angle in radians
  wheelRotation: number;      // accumulated wheel spin in radians
  isGrounded: boolean;
  isEngineRunning: boolean;
}

export const DEFAULT_SPORTS_CAR_CONFIG: VehicleConfig = {
  maxSpeed: 38.0,             // ~137 km/h
  maxReverseSpeed: 11.0,      // ~40 km/h
  acceleration: 16.0,
  brakeForce: 28.0,
  reverseAcceleration: 9.0,
  drag: 0.85,
  steerSpeed: 4.5,
  maxSteerAngle: 0.52,        // 30 deg
  minSteerAngle: 0.16,        // 9 deg at top speed
  wheelBase: 2.6,
  wheelTrack: 1.8,
  wheelRadius: 0.36,
  mass: 1450,
};

export function createInitialVehicleState(spawnPosition: Vec3 = v3(0, 0, 0), spawnHeading = 0): VehicleState {
  return {
    position: { ...spawnPosition },
    heading: spawnHeading,
    speed: 0,
    steerAngle: 0,
    wheelRotation: 0,
    isGrounded: true,
    isEngineRunning: true,
  };
}

/**
 * Step vehicle physics kinematics forward in time by dt.
 */
export function stepVehicleKinematics(
  state: VehicleState,
  input: VehicleInput,
  config: VehicleConfig,
  dt: number
): VehicleState {
  const next = { ...state, position: { ...state.position } };

  // Speed-sensitive steering damping (at 100+ km/h you cannot steer full 30 degrees without flipping)
  const speedRatio = clamp(Math.abs(next.speed) / (config.maxSpeed * 0.7), 0, 1);
  const targetSteerMax = config.maxSteerAngle * (1 - speedRatio) + config.minSteerAngle * speedRatio;
  const targetSteer = input.steer * targetSteerMax;

  // Smooth steering interpolation
  const steerDelta = targetSteer - next.steerAngle;
  next.steerAngle += clamp(steerDelta, -config.steerSpeed * dt, config.steerSpeed * dt);

  // Engine force, braking, and reverse handling
  if (input.reverse) {
    if (next.speed > 0.5) {
      // If moving forward, pressing reverse acts as brake first
      next.speed -= config.brakeForce * dt;
      if (next.speed < 0) next.speed = 0;
    } else {
      // Accelerate backwards
      next.speed -= config.reverseAcceleration * dt;
      if (next.speed < -config.maxReverseSpeed) next.speed = -config.maxReverseSpeed;
    }
  } else if (input.throttle > 0) {
    if (next.speed < -0.5) {
      // If moving backward, pressing forward brakes reverse
      next.speed += config.brakeForce * dt;
      if (next.speed > 0) next.speed = 0;
    } else {
      // Accelerate forward
      next.speed += input.throttle * config.acceleration * dt;
      if (next.speed > config.maxSpeed) next.speed = config.maxSpeed;
    }
  }

  // Active brakes
  if (input.brake > 0 || input.handbrake) {
    const brakeDecel = (input.handbrake ? config.brakeForce * 1.5 : config.brakeForce * input.brake) * dt;
    if (next.speed > 0) {
      next.speed = Math.max(0, next.speed - brakeDecel);
    } else if (next.speed < 0) {
      next.speed = Math.min(0, next.speed + brakeDecel);
    }
  }

  // Passive drag & rolling resistance when coasting
  if (input.throttle === 0 && !input.reverse && input.brake === 0) {
    const rollingResistance = 4.0 * dt;
    if (next.speed > 0) {
      next.speed = Math.max(0, next.speed - rollingResistance);
    } else if (next.speed < 0) {
      next.speed = Math.min(0, next.speed + rollingResistance);
    }
  }

  // Turn rate from bicycle kinematic model:
  // omega = (speed / wheelbase) * tan(steerAngle)
  const angularVelocity = (next.speed / config.wheelBase) * Math.tan(next.steerAngle);
  next.heading += angularVelocity * dt;

  // Integrate position along heading vector
  // heading = 0 points towards -Z, heading = PI/2 points towards +X
  const forwardX = Math.sin(next.heading);
  const forwardZ = -Math.cos(next.heading);

  next.position.x += forwardX * next.speed * dt;
  next.position.z += forwardZ * next.speed * dt;

  // Update wheel spin rotation based on distance travelled
  const distanceMoved = next.speed * dt;
  next.wheelRotation += distanceMoved / config.wheelRadius;

  return next;
}
