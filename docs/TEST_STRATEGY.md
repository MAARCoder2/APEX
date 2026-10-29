# TEST STRATEGY: PROJECT APEX V2
**Document ID:** `TST-APEX-V2`  

---

## 1. Testing Pyramid
1. **Level 1 — Pure Logic Unit Tests (`node:test` + `tsx --test`):**
   - High-speed, deterministic math, collision, vehicle kinematics, navigation, and mission state tests.
   - Run in milliseconds on every iteration; zero browser or GPU dependencies.
2. **Level 2 — Compilation & Lint Verification:**
   - Type-checking via `compile_applet` / `tsc --noEmit` ensures zero syntax or typing errors.
3. **Level 3 — Headless Browser & Journey Verification (`computer-use` + Playwright):**
   - Live browser testing to verify DOM accessibility tree, UI HUD responsiveness, WebGL rendering without exceptions, and user journeys.
