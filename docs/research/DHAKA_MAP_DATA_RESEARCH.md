# DHAKA MAP DATA RESEARCH: PROJECT APEX V2
**Date:** 2026-10-29  
**Geographic Target:** Gulshan Circle 2 District, Dhaka, Bangladesh  
**Coordinates Bounding Box:** Lat `[23.7910, 23.7975]`, Lon `[90.4120, 90.4185]`  

---

## 1. Selected District Rationale
Gulshan-2 is one of Dhaka's most iconic commercial and residential urban hubs:
- **Central Landmark:** Gulshan Circle 2 Roundabout (a major traffic hub with arterial roads radiating in 4 cardinal directions).
- **Major Arterial Roads:**
  - *Kamal Ataturk Avenue* (East-West axis connecting Gulshan 2 to Banani)
  - *Gulshan Avenue* (North-South axis connecting Gulshan 1 to Baridhara/Diplomatic Zone)
  - *Road 11 / Madani Avenue feeder roads*
- **Urban Texture:** High-rise commercial towers, modern shopping centers (Pink City, DCC Market), residential mid-rises, rooftop water tanks, overhead street cabling, neon Bengali & English commercial signage, rickshaw stands, and lush tropical trees lining avenues.

## 2. Geospatial Sourcing & OpenStreetMap Attribution
- **Source:** OpenStreetMap contributors (`https://www.openstreetmap.org/copyright`).
- **License:** Open Database License (ODbL) 1.0. Attribution: `© OpenStreetMap contributors`.
- **Coordinate Transformation:**
  - WGS84 coordinates (Latitude $\phi$, Longitude $\lambda$) are projected to a local metric Cartesian plane centered on Gulshan Circle 2 (`23.7940° N, 90.4150° E`).
  - Projection scale: 1 degree latitude $\approx 110,750$ meters; 1 degree longitude $\approx 101,900$ meters.
  - Origin `(0, 0, 0)` is placed precisely at the center of Gulshan 2 Roundabout.

## 3. Reliability & Offline Baking
Due to public Overpass API servers suffering intermittent rate limits and 502 gateway timeouts, the road network, intersection nodes, sidewalk paths, and plot polygons are baked into `src/game/world/dhakaMapData.ts`. This ensures:
1. Zero runtime API latency or failures.
2. 100% offline gameplay resilience.
3. Deterministic spawn points for player, vehicles, pedestrians, and mission markers.
