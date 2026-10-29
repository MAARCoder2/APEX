# GAME DESIGN DOCUMENT (GDD) — PROJECT APEX V2
**Document ID:** `GDD-APEX-V2`  

---

## 1. Game Premise
In the bustling urban sprawl of Dhaka's Gulshan-2 financial district, the player operates as an elite courier undertaking high-stakes assignments across congested avenues, navigating chaotic traffic, speeding around the Gulshan Circle 2 roundabout, and racing the clock.

## 2. Controls & Input Mapping
- **On Foot:**
  - `W / A / S / D` or `Arrow Keys`: Character movement (Forward, Left, Back, Right)
  - `Shift`: Sprint / Run
  - `Space`: Jump / Vault
  - `E` or `F`: Enter / Exit nearby vehicle (proximity prompt displayed when near car)
  - `Mouse / Pointer`: Orbit camera / Look around
- **In Vehicle:**
  - `W / Up`: Throttle / Accelerate
  - `S / Down`: Brake (when moving forward) / Reverse (when stopped)
  - `A / D / Left / Right`: Steer Left / Right (speed-dampened)
  - `Space`: Handbrake / Drift
  - `E` or `F`: Exit Vehicle (vehicle must be below 5 km/h for safe exit)
  - `H`: Car Horn
  - `R`: Reset vehicle upright if overturned
- **General UI:**
  - `M`: Toggle Minimap Zoom
  - `Tab` or `H`: Collapse / Expand HUD Dock (Zen Mode)

## 3. Mission Flow: "The Gulshan Delivery"
1. **Briefing:** Informant awaits player at Gulshan Circle 2 roundabout landmark.
2. **Phase 1:** Sprint to the central monument waypoint.
3. **Phase 2:** Locate the parked high-performance sports car on Kamal Ataturk Avenue. Press `E` to enter.
4. **Phase 3:** Drive through traffic along Gulshan Avenue to the dropoff safehouse on Road 11 before the 120-second timer runs out.
5. **Debriefing:** Cash reward credited, mission marked completed, with option to replay or roam freely.
