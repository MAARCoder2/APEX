# Changelog — Project Apex V2

## [2.0.1] - 2026-10-29
### Fixed
- Fixed `TypeError: Cannot set property fetch of #<Window> which has only a getter` caused by browser extension request interceptors attempting direct `window.fetch = ...` assignment. Configured a compatible getter/setter descriptor in `index.html` head to permit non-destructive assignment while preserving native fetch behavior.
- Added error capture listener for third-party `chrome-extension://` script exceptions.

## [2.0.0] - 2026-10-29
### Added
- Phase 0 Research & Feasibility: Environment audit, V1 inspection, tool audit, and asset license verification.
- Verified 3D binary assets downloaded to `/public/assets/models/`: `Soldier.glb`, `ferrari.glb`, `Xbot.glb`, and Kenney CC0 modular road kit (`road-straight.glb`, `road-intersection.glb`, `road-split.glb`, `road-straight-lightposts.glb`).
- Decoupled pure logic modules: `src/game/physics/math.ts`, `src/game/physics/vehicleKinematics.ts`, `src/game/missions/missionRules.ts`, `src/game/world/navGraph.ts`.
- 18 automated unit tests with 100% pass rate using Node's built-in test runner.
- Complete documentation set covering PRD, GDD, Technical Architecture, Visual Direction, Asset Register, and Acceptance Criteria.
