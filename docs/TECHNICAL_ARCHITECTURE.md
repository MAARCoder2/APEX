# TECHNICAL ARCHITECTURE: PROJECT APEX V2
**Document ID:** `ARCH-APEX-V2`  

---

## 1. System Topology & Layers
```
┌────────────────────────────────────────────────────────┐
│               REACT 19 UI & HUD LAYER                  │
│    Minimap Radar | Speedometer | Mission HUD | Dock    │
└──────────────────────────┬─────────────────────────────┘
                           │ (Read-only refs & events)
┌──────────────────────────▼─────────────────────────────┐
│                 GAME ENGINE (GameEngine.ts)             │
│   Main Loop (Clock/RAF) | Input Manager | Audio Rig    │
├───────────────┬────────────────┬───────────────────────┤
│               │                │                       │
│  WORLD LAYER  │ ENTITY LAYER   │ PHYSICS LAYER         │
│  CityDistrict │ PlayerCtrl     │ Rapier 3D / Math      │
│  Road Network │ VehicleCtrl    │ Swept Collisions      │
│  Nav Graph    │ Traffic/NPCs   │ Kinematics            │
└───────┬───────┴────────┬───────┴───────────┬───────────┘
        │                │                   │
┌───────▼────────────────▼───────────────────▼───────────┐
│               THREE.JS WEBGL RENDERER                  │
│   PBR Shaders | PMREM Studio Env | Shadow Rig | GLTF   │
└────────────────────────────────────────────────────────┘
```

## 2. Fixed-Step Physics Synchronization
- The physics engine integrates at a fixed time-step ($dt = 1/60\text{ s}$).
- Variable render frames accumulate delta time; physics advances in integer sub-steps to guarantee deterministic collision response without jitter or tunneling.
- Render meshes synchronize positions and rotations from physics rigid bodies at the end of each frame.

## 3. Memory & Resource Disposal
- All Three.js objects (geometries, materials, textures, animations) implement explicit `.dispose()` methods called during engine unmount or level reset.
- Window event listeners (`keydown`, `keyup`, `pointerdown`, `pointermove`, `resize`) are bound to named class methods and removed in `GameEngine.dispose()`.
