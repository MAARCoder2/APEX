# RISKS AND MITIGATIONS: PROJECT APEX V2
**Document ID:** `RSK-APEX-V2`  

---

1. **Risk:** Unrigged character models or robotic limb rotation.
   - *Mitigation:* Direct integration of `Soldier.glb` and `Xbot.glb` with Three.js `AnimationMixer` and skeletal weights.
2. **Risk:** High-speed physics tunneling through walls.
   - *Mitigation:* Continuous swept raycast checks and Rapier 3D fixed time-stepping.
3. **Risk:** Vehicle exit clipping into obstacles.
   - *Mitigation:* Multi-directional clearance testing (left door, right door, roof) to ensure player spawns in open collision-free space.
4. **Risk:** Headless browser CPU starvation during automated tests.
   - *Mitigation:* `isSoftwareGl` detection with `afterDraw()` frame pacing and fallback rendering loop.
