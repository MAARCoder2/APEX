# ACCEPTANCE CRITERIA: PROJECT APEX V2
**Document ID:** `AC-APEX-V2`  

---

| ID | Feature / System | Verifiable Pass Condition | Evidence Method |
|---|---|---|---|
| `AC-01` | **M0 Build & Unit Tests** | Clean compile with 0 TypeScript errors, 18/18 unit tests pass in `< 1.0 s`. | `npx tsx --test` |
| `AC-02` | **M1 3D Asset Loading** | `Soldier.glb`, `ferrari.glb`, and roads load into Three.js scene without 404s. | Playwright screenshot / GLTFLoader success |
| `AC-03` | **M2 Character Locomotion** | Third-person character moves via WASD, plays Idle/Walk/Run animations, collides with walls without clipping or falling. | Live game testing & Playwright |
| `AC-04` | **M3 Drivable Vehicle** | Player can press 'E' to enter vehicle; car drives with acceleration, steering, brakes, and reverse; player can exit cleanly without clipping into geometry. | Live game testing |
| `AC-05` | **M4 Dhaka District World** | Gulshan-2 district renders with recognizable roundabout, avenues, buildings with Bengali signs, and street props. | Visual inspection |
| `AC-06` | **M5 Traffic & Missions** | NPC vehicles and pedestrians travel along road waypoints; player can initiate, complete, and replay "The Gulshan Delivery" mission. | Objective tracking & status verification |
| `AC-07` | **M6 HUD & Audio** | Responsive minimap radar, speedometer, collapsible Zen dock, and procedural Web Audio SFX play without console errors. | Browser audio & UI interaction |
