# TASK LEDGER: PROJECT APEX V2
**Document Version:** 1.0.0  
**Current Milestone:** M0 / M1 Implementation  

---

| Task ID | Milestone | Description | Dependencies | Acceptance Test | Status | Evidence |
|---|---|---|---|---|---|---|
| `TSK-P0-01` | Phase 0 | Environment & runtime audit | None | Inspect OS, Node, WebGL | `VERIFIED` | `docs/research/ENVIRONMENT_AUDIT.md` |
| `TSK-P0-02` | Phase 0 | V1 reference repository audit | None | Clone & audit bugs in V1 | `VERIFIED` | `docs/research/V1_LESSONS_AND_BUG_AUDIT.md` |
| `TSK-P0-03` | Phase 0 | Asset discovery & licensing verification | None | Verify CC0/CC-BY terms & fetch GLB files | `VERIFIED` | `docs/ASSET_REGISTER.md` |
| `TSK-P0-04` | Phase 0 | Dhaka map data research | None | Define Gulshan-2 coordinates & OSM ODbL attribution | `VERIFIED` | `docs/research/DHAKA_MAP_DATA_RESEARCH.md` |
| `TSK-P0-05` | Phase 0 | Readiness Review gate | P0-01..04 | Formal gate review pass | `VERIFIED` | `docs/READINESS_REVIEW.md` |
| `TSK-M0-01` | M0 | Setup V2 clean packages (`three`, `@dimforge/rapier3d-compat`) | P0-05 | npm install succeeds without peer conflicts | `VERIFIED` | `package.json` |
| `TSK-M0-02` | M0 | Physics math & game rules unit tests | M0-01 | `npx --yes tsx --test src/game/*.test.ts` passes | `VERIFIED` | `src/game/physics.test.ts` (18/18 PASS) |
| `TSK-M1-01` | M1 | 3D Engine & Asset Loader subsystem | M0-01 | Load `Soldier.glb`, `ferrari.glb`, and roads into scene | `VERIFIED` | `src/game/GameEngine.ts` |
| `TSK-M2-01` | M2 | Character controller, animation mixer & camera | M1-01 | Third-person WASD locomotion & ground collision | `VERIFIED` | `.playwright-cli/r1-desktop.png` |
| `TSK-M3-01` | M3 | Drivable vehicle physics & entry/exit | M2-01 | Enter car, accelerate, steer, brake, exit | `VERIFIED` | `.playwright-cli/r2-driving.png` |
| `TSK-M4-01` | M4 | Dhaka Gulshan-2 district procedural city | M1-01 | Roads, buildings, signage, and props | `VERIFIED` | `src/game/world/CityDistrict.ts` |
| `TSK-M5-01` | M5 | Traffic, pedestrians, and first mission | M3-01, M4-01 | NPC cars, pedestrians & complete delivery mission | `VERIFIED` | `src/game/missions/MissionManager.ts` |
