# TOOL AND PLUGIN AUDIT: PROJECT APEX V2
**Date:** 2026-10-29  
**Auditor:** Project Apex V2 Core Engineering Team  

---

## 1. Environment Tooling Audit

### Available & Verified Tools
1. **Node.js & npm:** Node `v22.23.4`, npm `10.9.9` — Full package management and execution capability.
2. **TypeScript & tsx:** TypeScript compiler and `tsx` (v4.21.0) runner available for fast unit testing via `npx --yes tsx --test`.
3. **Playwright CLI & Computer-Use:** Headless browser automation via `computer-use` skill for DOM inspection, visual screenshot capture, and journey verification.
4. **Shell Execution:** Sandboxed Linux bash (`run_command`, `manage_task`) for package installation, asset fetching, and test execution.
5. **Vite Development Server:** Vite 8.3 running on port 3000 with HMR disabled (`DISABLE_HMR=true`) for stable non-flickering agent edits.

### Unavailable Tools & Fallback Strategies
1. **Superpowers Plugin / MCP Server:** No external "Superpowers" or custom MCP server daemon is installed in this runtime container.
   - *Strategy:* Fully reproduce the disciplined Superpowers workflow through the mandatory `ultra-mode` skill: test-driven unit verification (`node:test`), step-by-step milestone execution, and Playwright browser verification before sign-off.
2. **Blender CLI:** Blender binary is not installed in container (`which blender` returned none).
   - *Strategy:* Rely on pre-converted, game-ready GLB binary assets and programmatic Three.js asset manipulation (procedural vertex compute, bounding box generation, material assignment, and animation retargeting).
3. **External Cloud Tile Extractors:** No third-party tile extractors.
   - *Strategy:* Use authorized OpenStreetMap data and offline-baked geospatial geojson/coordinate graphs for the Dhaka Gulshan-2 district.
