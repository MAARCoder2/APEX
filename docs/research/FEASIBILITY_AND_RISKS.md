# FEASIBILITY AND RISKS: PROJECT APEX V2
**Date:** 2026-10-29  

---

## 1. Technical Feasibility
1. **Asset Sizing:** Total GLB model payload is ~6.6 MB uncompressed, loading in < 1.5 seconds over standard broadband.
2. **Memory Footprint:** Peak JS heap < 120 MB; GPU texture memory < 64 MB.
3. **Framerate Targets:** 60 FPS on dedicated desktop GPUs; 30+ FPS on integrated Intel Iris / AMD Radeon Graphics.

## 2. Risk Matrix & Mitigations

| Risk Description | Severity | Probability | Mitigation Strategy |
|---|---|---|---|
| **Headless SwiftShader CPU Starvation** | High | High (in CI / test) | Implement `afterDraw()` frame synchronization guard on software WebGL to allow browser snapshots/screenshots without CPU lockups. |
| **Physics / Render Desynchronization** | High | Low | Run Rapier physics simulation at fixed 60Hz step ($dt = 1/60s$) decoupled from variable render delta times. |
| **Asset Licensing Disputes** | Critical | Negligible | Exclusively use CC0, MIT, and CC-BY models with documented provenance in `docs/ASSET_REGISTER.md`. |
| **Overly Dense City Choking Draw Calls** | Medium | Medium | Merge static ground and road geometry; use `THREE.InstancedMesh` for repeated street props (trees, lightposts, barriers). |
| **Vehicle Flipping / Instability** | Medium | Medium | Lower center of mass below axle line, apply angular damping, and implement an automatic recovery key (Press 'R' to reset upright). |
