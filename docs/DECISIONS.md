# ARCHITECTURAL DECISIONS: PROJECT APEX V2
**Date:** 2026-10-29  

---

## ADR-001: Clean V2 Foundation Over Patching V1
- **Context:** V1 had fundamental issues with box primitives, lack of skeletal animation, ad-hoc sphere collision overlap, listener leaks, and missing unit test files.
- **Decision:** Build Project Apex V2 from a clean, modular foundation rather than attempting to patch V1.
- **Consequences:** Cleaner code structure, decoupled testable modules, reliable state transitions.

## ADR-002: Asset Strategy Selection — Option A
- **Context:** User requested asset reuse. Evaluated Option A (Licensed assets + Dhaka geo layout), Option B (Cesium OSM), Option C (Google 3D Tiles), Option D (Monolithic city pack).
- **Decision:** Select Option A. Reject Google 3D Tiles (prohibited extraction) and Cesium OSM (untextured boxes, quota risks).
- **Consequences:** Safe, high visual fidelity, 60 FPS performance, authentic Dhaka atmosphere.

## ADR-003: Pure Logic Decoupling for Unit Tests
- **Context:** Ultra mode mandates fast unit testing of logic before visual checks.
- **Decision:** Implement pure physics math, vehicle kinematics, waypoint navigation, and mission state machines in isolated TypeScript modules tested with `node:test` and `node:assert/strict` via `npx --yes tsx --test`.
- **Consequences:** Regression-free mechanics, instant sub-second verification.
