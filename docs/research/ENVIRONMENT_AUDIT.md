# ENVIRONMENT AUDIT: PROJECT APEX V2
**Date:** 2026-10-29  
**Auditor:** Project Apex V2 Core Engineering Team  
**Environment Status:** Live Container Verified  

---

## 1. Runtime & Host OS Specifications
- **Operating System:** Linux localhost `4.19.0-gvisor #1 SMP Sun Jan 10 15:06:54 PST 2016 x86_64 GNU/Linux`
- **Node.js Version:** `v22.23.4` (LTS container environment)
- **npm Version:** `10.9.9`
- **Shell:** GNU Bash / Linux CLI
- **Workspace Root:** `/app/applet` (Client/Server root)
- **Container Memory / CPU:** Virtualized sandbox under gVisor container runtime

## 2. Graphics & Rendering Capabilities
- **WebGL Environment:** Headless Chromium with Software-WebGL (SwiftShader / llvmpipe pipeline).
- **Target Renderer:** Three.js r186+ with `isSoftwareGl` runtime detection.
- **Hardware Acceleration:** In local headless testing, software rasterization is employed; production deployment targets client GPU hardware (WebGL2 / Desktop Chrome, Edge, Firefox, Safari).
- **Render Mode:** Continuous 60 FPS tick with `afterDraw()` frame synchronization guard on software WebGL to prevent headless starvation.

## 3. Installed Packages & Build Runtimes
- **Vite:** 8.3.0
- **TypeScript:** 7.0.2
- **React:** 19.0.1 & React-DOM 19.0.1
- **Three.js:** ^0.186.1
- **Rapier 3D Physics:** `@dimforge/rapier3d-compat` (WASM / WebAssembly + Node support)
- **Tailwind CSS:** 4.3.3 (@tailwindcss/vite)
- **Animation / Motion:** `motion` 12.23.24
- **Icons:** `lucide-react` 0.546.0

## 4. 3D & Digital Content Creation Tooling
- **Blender CLI:** Checked via `which blender`. Result: `No blender binary in PATH`.
- **Mitigation & Strategy:** Rather than relying on a local Blender install in the container, 3D asset conversion, inspection, bounding-box computation, and mesh assembly are handled programmatically via Three.js node scripts, GLTFLoader, and modular procedural composition complying with Three.js architectural standards.

## 5. Network Connectivity & Sourcing
- **Internet Outbound:** Verified via curl to GitHub APIs, Raw GitHub user content, and OpenStreetMap endpoints.
- **Asset Access:** Successful direct fetch of verified CC0 and CC-BY GLB assets (`Soldier.glb`, `ferrari.glb`, `road-straight.glb`, `road-intersection.glb`, `road-split.glb`, `road-straight-lightposts.glb`, `Xbot.glb`).
- **Map APIs:** Overpass public endpoint experiences periodic 502/rate-limits; mitigated by offline-baked, source-verified Gulshan-2 Dhaka geospatial coordinate graph.
