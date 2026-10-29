# V1 LESSONS AND BUG AUDIT: PROJECT APEX V2
**Date:** 2026-10-29  
**Reference Repository:** `https://github.com/MAARCoder2/Project-GTA-6`  
**Inspection Mode:** Read-Only Shallow Clone to `/tmp/v1_ref`  

---

## 1. Executive Summary of V1 Inspection
An audit of the V1 repository was conducted. While V1 established an enthusiastic concept, it suffered from fundamental architectural, visual, physics, and gameplay flaws:
1. **Visual Primitives (Box Characters & Vehicles):** Characters and cars were assembled from unrigged box primitives (`THREE.BoxGeometry`). Character locomotion used procedural sine-wave limb rotations (`Math.sin(elapsed * 10)`), with no real skeletal animation, no foot planting, and no proper human silhouettes.
2. **Physics & Collision Failure:** V1 used ad-hoc TypeScript sphere-vs-AABB overlap correction instead of a continuous rigid-body physics engine. This led to high-speed tunnelling, characters clipping through building walls, and vehicles rotating unnaturally on contact.
3. **Vehicle Dynamics & Entry/Exit:** Vehicle collision used a single sphere radius derived from vehicle width rather than an oriented bounding box (OBB) or rigid-body chassis. Vehicle entry/exit logic did not validate clearances, frequently trapping the player inside geometry.
4. **AI & Traffic Pathfinding:** NPCs and police cars moved in straight lines toward arbitrary waypoints rather than traversing a connected road or sidewalk navigation graph. Police cruisers regularly drove straight through buildings and obstacles during pursuit.
5. **Memory Leaks & Event Handling:** Event listeners (`keydown`, `keyup`, `resize`, `pointerdown`) were attached via anonymous closures and were never detached on unmount. Geometries and materials were not systematically disposed.
6. **Documentation Discrepancies:** Test documentation in V1 claimed 15 unit tests and full mission test coverage, but several referenced test suites (such as `missions.test.ts`) were missing from the tracked tree.

## 2. Risk Matrix & V2 Architectural Solutions

| V1 Defect / Risk Area | V1 Root Cause | V2 Clean Architecture Solution |
|---|---|---|
| **Box-shaped characters & rigid limb sine-flailing** | No 3D model pipeline or rigged skeleton | Integration of game-ready rigged humanoid models (`Soldier.glb`, `Xbot.glb`) with Three.js `AnimationMixer`, blending Idle, Walk, and Run states. |
| **Box cars & unrealistic handling** | Unrigged composite box geometry with instant angular changes | Detailed vehicle model (`ferrari.glb`) with separate body, interior, and 4 wheel pivots synced to Rapier/raycast wheel kinematics and suspension. |
| **Aiming & hit detection through walls** | Raycasts only checked distance to target without testing occluding scene geometry | Occlusion-aware raycasting against building and road collider sets using nearest-hit filtering. |
| **Tunnelling through walls & ground** | Discrete post-step overlap correction | Rapier 3D / swept continuous collision detection (CCD) with fixed-step physics integration. |
| **Erratic AI & police driving through walls** | Linear vector steering without waypoint road graphs | Structured Dhaka waypoint graph with connected lanes, intersection rules, and raycast obstacle avoidance. |
| **Listener & GPU memory leaks** | Anonymous handlers and missing `.dispose()` calls | Strict lifecycle management: named listener unbinding on unmount, full geometry/material/texture disposal, and PMREM cleanup. |
