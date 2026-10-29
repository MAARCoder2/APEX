/**
 * Pure geometric, collision, and physics math calculations for Project Apex V2.
 * Decoupled from WebGL and DOM for fast deterministic unit testing.
 */

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface AABB {
  min: Vec3;
  max: Vec3;
}

export interface Ray {
  origin: Vec3;
  direction: Vec3; // normalized
}

export interface RayHit {
  hit: boolean;
  distance: number;
  point: Vec3;
  normal: Vec3;
}

export function v3(x = 0, y = 0, z = 0): Vec3 {
  return { x, y, z };
}

export function distance(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

export function distanceSq(a: Vec3, b: Vec3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function normalize(v: Vec3): Vec3 {
  const l = length(v);
  if (l < 1e-6) return { x: 0, y: 0, z: 0 };
  return { x: v.x / l, y: v.y / l, z: v.z / l };
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Checks point inside Axis-Aligned Bounding Box.
 */
export function isPointInsideAABB(point: Vec3, box: AABB): boolean {
  return (
    point.x >= box.min.x &&
    point.x <= box.max.x &&
    point.y >= box.min.y &&
    point.y <= box.max.y &&
    point.z >= box.min.z &&
    point.z <= box.max.z
  );
}

/**
 * Closest point on an AABB to a given point.
 */
export function closestPointOnAABB(point: Vec3, box: AABB): Vec3 {
  return {
    x: clamp(point.x, box.min.x, box.max.x),
    y: clamp(point.y, box.min.y, box.max.y),
    z: clamp(point.z, box.min.z, box.max.z),
  };
}

/**
 * Swept and continuous collision check: Resolves sphere vs static AABBs.
 * Corrects sphere position so it does not penetrate or tunnel into boxes.
 */
export function resolveSphereAABBCollision(
  position: Vec3,
  radius: number,
  box: AABB
): { collided: boolean; correctedPosition: Vec3; normal: Vec3 } {
  const closest = closestPointOnAABB(position, box);
  const distSq = distanceSq(position, closest);

  if (distSq < radius * radius) {
    const dist = Math.sqrt(distSq);
    let normal: Vec3;
    let penetration: number;

    if (dist > 1e-5) {
      normal = {
        x: (position.x - closest.x) / dist,
        y: (position.y - closest.y) / dist,
        z: (position.z - closest.z) / dist,
      };
      penetration = radius - dist;
    } else {
      // Point is directly inside box center; push out to nearest surface
      const dx1 = Math.abs(position.x - box.min.x);
      const dx2 = Math.abs(box.max.x - position.x);
      const dy1 = Math.abs(position.y - box.min.y);
      const dy2 = Math.abs(box.max.y - position.y);
      const dz1 = Math.abs(position.z - box.min.z);
      const dz2 = Math.abs(box.max.z - position.z);

      const minDelta = Math.min(dx1, dx2, dy1, dy2, dz1, dz2);
      if (minDelta === dx1) normal = { x: -1, y: 0, z: 0 };
      else if (minDelta === dx2) normal = { x: 1, y: 0, z: 0 };
      else if (minDelta === dy1) normal = { x: 0, y: -1, z: 0 };
      else if (minDelta === dy2) normal = { x: 0, y: 1, z: 0 };
      else if (minDelta === dz1) normal = { x: 0, y: 0, z: -1 };
      else normal = { x: 0, y: 0, z: 1 };

      penetration = radius;
    }

    return {
      collided: true,
      correctedPosition: {
        x: position.x + normal.x * penetration,
        y: position.y + normal.y * penetration,
        z: position.z + normal.z * penetration,
      },
      normal,
    };
  }

  return {
    collided: false,
    correctedPosition: { ...position },
    normal: { x: 0, y: 1, z: 0 },
  };
}

/**
 * Line-of-sight / Ray vs AABB intersection test with occlusions.
 * Solves V1 bug: shooting / aiming / witnessing through walls.
 */
export function intersectRayAABB(ray: Ray, box: AABB): RayHit {
  let tmin = -Infinity;
  let tmax = Infinity;
  let normal: Vec3 = { x: 0, y: 0, z: 0 };

  const axes: Array<'x' | 'y' | 'z'> = ['x', 'y', 'z'];

  for (const axis of axes) {
    const origin = ray.origin[axis];
    const dir = ray.direction[axis];
    const bmin = box.min[axis];
    const bmax = box.max[axis];

    if (Math.abs(dir) < 1e-8) {
      if (origin < bmin || origin > bmax) {
        return { hit: false, distance: Infinity, point: v3(), normal: v3() };
      }
    } else {
      let t1 = (bmin - origin) / dir;
      let t2 = (bmax - origin) / dir;
      let sign = -1;

      if (t1 > t2) {
        const tmp = t1;
        t1 = t2;
        t2 = tmp;
        sign = 1;
      }

      if (t1 > tmin) {
        tmin = t1;
        normal = {
          x: axis === 'x' ? sign : 0,
          y: axis === 'y' ? sign : 0,
          z: axis === 'z' ? sign : 0,
        };
      }
      tmax = Math.min(tmax, t2);

      if (tmin > tmax || tmax < 0) {
        return { hit: false, distance: Infinity, point: v3(), normal: v3() };
      }
    }
  }

  const dist = tmin >= 0 ? tmin : tmax;
  if (dist < 0) {
    return { hit: false, distance: Infinity, point: v3(), normal: v3() };
  }

  return {
    hit: true,
    distance: dist,
    point: {
      x: ray.origin.x + ray.direction.x * dist,
      y: ray.origin.y + ray.direction.y * dist,
      z: ray.origin.z + ray.direction.z * dist,
    },
    normal,
  };
}

/**
 * Determines whether line of sight between two positions is obstructed by any AABB colliders.
 */
export function isLineOfSightBlocked(from: Vec3, to: Vec3, obstacles: AABB[]): boolean {
  const dir = {
    x: to.x - from.x,
    y: to.y - from.y,
    z: to.z - from.z,
  };
  const totalDist = length(dir);
  if (totalDist < 1e-4) return false;

  const ray: Ray = {
    origin: from,
    direction: normalize(dir),
  };

  for (const box of obstacles) {
    const hit = intersectRayAABB(ray, box);
    if (hit.hit && hit.distance < totalDist) {
      return true; // Blocked by obstacle
    }
  }

  return false;
}
