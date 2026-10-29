import test from 'node:test';
import assert from 'node:assert/strict';
import {
  v3,
  distance,
  clamp,
  isPointInsideAABB,
  resolveSphereAABBCollision,
  intersectRayAABB,
  isLineOfSightBlocked,
  AABB,
  Ray,
} from './physics/math.ts';

test('distance calculates 3D Euclidean distance accurately', () => {
  const d = distance(v3(0, 0, 0), v3(3, 4, 0));
  assert.equal(d, 5);
});

test('clamp restricts values to min/max range', () => {
  assert.equal(clamp(15, 0, 10), 10);
  assert.equal(clamp(-5, 0, 10), 0);
  assert.equal(clamp(5, 0, 10), 5);
});

test('isPointInsideAABB detects points inside and outside box', () => {
  const box: AABB = {
    min: v3(-10, 0, -10),
    max: v3(10, 20, 10),
  };

  assert.equal(isPointInsideAABB(v3(0, 5, 0), box), true);
  assert.equal(isPointInsideAABB(v3(15, 5, 0), box), false);
  assert.equal(isPointInsideAABB(v3(0, -1, 0), box), false);
});

test('resolveSphereAABBCollision prevents penetration and pushes out along normal', () => {
  const box: AABB = {
    min: v3(10, 0, 10),
    max: v3(20, 10, 20),
  };

  // Sphere with radius 1 positioned slightly inside boundary at x=9.5
  const pos = v3(9.5, 5, 15);
  const result = resolveSphereAABBCollision(pos, 1.0, box);

  assert.equal(result.collided, true);
  // Should be pushed out to x = 9.0 (radius 1 from x=10)
  assert.ok(result.correctedPosition.x <= 9.0 + 1e-4);
  assert.equal(result.normal.x, -1);
});

test('intersectRayAABB detects raycast hits against blocking walls', () => {
  const box: AABB = {
    min: v3(10, 0, -5),
    max: v3(15, 10, 5),
  };

  const ray: Ray = {
    origin: v3(0, 5, 0),
    direction: v3(1, 0, 0), // points straight towards box
  };

  const hit = intersectRayAABB(ray, box);
  assert.equal(hit.hit, true);
  assert.equal(hit.distance, 10);
  assert.equal(hit.point.x, 10);
});

test('isLineOfSightBlocked prevents aiming and shooting through walls (solves V1 defect)', () => {
  const wall: AABB = {
    min: v3(-2, 0, -5),
    max: v3(2, 10, 5),
  };

  // Player at (-10, 2, 0), Target at (10, 2, 0), Wall in between
  const player = v3(-10, 2, 0);
  const target = v3(10, 2, 0);
  const clearTarget = v3(-10, 2, 20); // no wall between player and clearTarget

  assert.equal(isLineOfSightBlocked(player, target, [wall]), true);
  assert.equal(isLineOfSightBlocked(player, clearTarget, [wall]), false);
});
