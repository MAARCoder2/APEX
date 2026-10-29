# CITY ASSET STRATEGY COMPARISON: PROJECT APEX V2
**Date:** 2026-10-29  
**Decision:** Primary Strategy = Option A (Licensed Assets + Dhaka Geospatial Layout + Dhaka Procedural Variations)

---

## 1. Options Evaluated

### Option A — Licensed Assets + Dhaka Geographic Layout (Selected Primary Strategy)
- **Concept:** Combine real OpenStreetMap road and plot footprints for Dhaka (Gulshan-2) with modular licensed 3D models (Kenney CC0 roads, street furniture, trees, verified GLB character/vehicle models) and procedural architectural assemblies (3–12 part textured buildings with rooftop tanks, antennas, Bengali signage, and awnings).
- **Feasibility:** 10/10. Zero legal risk, zero unauthorized extraction, high browser performance, 60 FPS capable, full collision control.
- **Verdict:** **SELECTED.**

### Option B — Streamed 3D Building Layers (Cesium OSM Buildings)
- **Concept:** Live streaming 3D tiles from Cesium ion.
- **Analysis:** Requires CesiumJS or 3D Tiles renderer wrapper alongside Three.js. OSM Buildings lack detailed architectural textures (they are untextured white/grey prisms with coarse bounding boxes), lack proper game collision meshes, and require monthly API quotas and user tokens.
- **Verdict:** **REJECTED.** Adds excessive architectural complexity without visual fidelity or collision benefits.

### Option C — Google Photorealistic 3D Tiles
- **Concept:** Streaming Google Photorealistic 3D Tiles into Three.js.
- **Analysis:** Google terms strictly prohibit extracting, caching beyond session limits, reverse engineering, tracing geometry, or using tiles as collision geometry. Scraping or converting tiles to standalone models is legally forbidden.
- **Verdict:** **REJECTED.** Legal and technical constraints make it unsuitable for browser game physics and collision.

### Option D — Complete Downloadable City Pack
- **Concept:** Sourcing a single monolithic city package.
- **Analysis:** Monolithic packages found on marketplaces are either tailored for Unreal Engine 5 Nanite (gigabytes in size, unrenderable in WebGL) or generic North American grids that do not evoke Dhaka.
- **Verdict:** **REJECTED AS MONOLITH.** Modularity from Option A provides authentic Dhaka urban identity while respecting browser asset budgets.
