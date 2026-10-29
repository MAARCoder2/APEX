# Project Apex V2 — Dhaka Open World 3D

Project Apex V2 is an original, browser-native 3D open-world action game set in a Dhaka-inspired urban district (Gulshan-2). Built on Three.js, Rapier 3D physics, and React 19, it features skeletal humanoid locomotion, a drivable sports car with physical kinematics and suspension, a geographically grounded district layout, traffic, and full mission gameplay.

## Features
- **Third-Person Locomotion:** Rigged humanoid character (`Soldier.glb`) with seamless Idle, Walk, and Run skeletal animation blending, jump mechanics, and wall collision.
- **Drivable Vehicle:** High-detail sports car (`ferrari.glb`) with physical acceleration, steering damping, braking, reverse gear, spinning wheels, and seamless vehicle entry/exit.
- **Dhaka Urban District (Gulshan-2):** Geographically grounded around Gulshan Circle 2 roundabout, Kamal Ataturk Avenue, modular roads, sidewalks, high-rises with Bengali commercial signage, and street props.
- **Traffic & Pedestrians:** Waypoint navigation graph connecting roads and sidewalks for autonomous traffic and NPC pedestrians.
- **Mission Gameplay:** "The Gulshan Delivery" mission with multi-stage objectives, delivery checkpoint markers, countdown timer, and replayability.
- **Synthesized Audio:** Zero-dependency Web Audio API sound rig for engine revs, tire screeches, horns, and footstep pacing.
- **Ergonomic HUD:** Real-time minimap radar, digital speedometer, mission tracker, and collapsible bottom dock (Zen mode).

## Controls
- **On Foot:**
  - `W / A / S / D`: Move
  - `Shift`: Sprint
  - `Space`: Jump
  - `E` or `F`: Enter nearby vehicle
  - `Mouse`: Orbit camera
- **In Vehicle:**
  - `W`: Accelerate / Throttle
  - `S`: Brake / Reverse
  - `A / D`: Steer Left / Right
  - `Space`: Handbrake
  - `E` or `F`: Exit vehicle
  - `H`: Horn
  - `R`: Reset vehicle upright
- **General:**
  - `Tab` or `H`: Toggle HUD Dock (Zen Mode)

## Development & Testing
```bash
# Run unit tests
npm test

# Build production bundle
npm run build
```
