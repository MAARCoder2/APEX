# TECHNOLOGY EVALUATION: PROJECT APEX V2
**Date:** 2026-10-29  

---

## 1. Engine & Graphics Pipeline
- **Three.js (r186+):** Proven WebGL/WebGPU 3D library with full PBR shading, `GLTFLoader`, `AnimationMixer`, `InstancedMesh`, `PMREMGenerator`, and shadow map pipelines.
- **Color Pipeline:** `THREE.SRGBColorSpace` for color textures and output; `THREE.ACESFilmicToneMapping` with exposure 1.1.
- **Software WebGL Guard:** Built-in detection of SwiftShader / llvmpipe via `isSoftwareGl` probe to safeguard headless test runs and adjust shadow maps / antialiasing appropriately without changing scene geometry.

## 2. Physics Engine Evaluation
- **Selected: Rapier 3D (`@dimforge/rapier3d-compat`):**
  - Modern, high-performance physics engine written in Rust and compiled to WebAssembly.
  - Supports continuous collision detection (CCD), raycasting, dynamic/kinematic/fixed rigid bodies, compound colliders, and contact impulse resolution.
  - Replaces V1's brittle custom overlap logic with robust mathematical guarantees.

## 3. UI and Overlay Architecture
- **React 19 + Tailwind CSS:** Provides a reactive HUD overlay containing minimap/radar, vehicle speedometer, mission objectives, weapon/health indicators, and audio settings.
- **Collapsible Bottom Dock:** Consolidated control interface complying with Three.js guidelines (zero side-panel occlusion; collapsible Zen mode).
