/**
 * Three.js 3D City District Builder for Dhaka Gulshan-2 in Project Apex V2.
 * Adheres to Three.js design constitution: 3-12 part composite assemblies,
 * varied roughness/metalness, grounded bottom-center pivots, and zero 404s.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {
  DHAKA_GULSHAN2_BUILDINGS,
  DHAKA_STREETLIGHTS,
  DHAKA_TREES,
  getDhakaBuildingColliders,
  BuildingData,
} from './dhakaMapData.ts';
import { AABB } from '../physics/math.ts';

export class CityDistrict {
  public group: THREE.Group;
  public colliders: AABB[] = [];
  private materials: THREE.Material[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private textures: THREE.Texture[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'DhakaGulshan2District';
    this.colliders = getDhakaBuildingColliders();
  }

  public init(scene: THREE.Scene, loader: GLTFLoader): void {
    this.buildGroundAndRoads();
    this.buildGulshanRoundabout();
    this.buildBuildings();
    this.buildStreetlights();
    this.buildTrees();
    scene.add(this.group);
  }

  /**
   * Builds the foundational terrain, sidewalks, and cross-arterial roads.
   */
  private buildGroundAndRoads(): void {
    // 1. Terrain Grass/Pavement base (extends beyond playable perimeter to horizon)
    const groundGeo = new THREE.PlaneGeometry(600, 600, 1, 1);
    groundGeo.rotateX(-Math.PI / 2);
    this.geometries.push(groundGeo);

    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x242a32,
      roughness: 0.95,
      metalness: 0.05,
    });
    this.materials.push(groundMat);

    const groundMesh = new THREE.Mesh(groundGeo, groundMat);
    groundMesh.receiveShadow = true;
    groundMesh.position.y = -0.05;
    this.group.add(groundMesh);

    // 2. Concrete Sidewalk Blocks (offset by +0.02 to avoid coplanar Z-fighting)
    const sidewalkMat = new THREE.MeshStandardMaterial({
      color: 0x6e7682,
      roughness: 0.85,
      metalness: 0.1,
    });
    this.materials.push(sidewalkMat);

    // 4 Quad Sidewalk Plazas
    const quadOffsets = [
      { x: -55, z: -55 },
      { x: 55, z: -55 },
      { x: -55, z: 55 },
      { x: 55, z: 55 },
    ];

    quadOffsets.forEach((pos) => {
      const plazaGeo = new THREE.BoxGeometry(85, 0.25, 85);
      this.geometries.push(plazaGeo);
      const plazaMesh = new THREE.Mesh(plazaGeo, sidewalkMat);
      plazaMesh.position.set(pos.x, 0.125, pos.z);
      plazaMesh.receiveShadow = true;
      this.group.add(plazaMesh);
    });

    // 3. Arterial Asphalt Roads (North-South Gulshan Ave & East-West Kamal Ataturk Ave)
    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x1f2328,
      roughness: 0.8,
      metalness: 0.15,
    });
    this.materials.push(asphaltMat);

    // North-South Road (14m wide)
    const nsRoadGeo = new THREE.PlaneGeometry(14, 300);
    nsRoadGeo.rotateX(-Math.PI / 2);
    this.geometries.push(nsRoadGeo);
    const nsRoad = new THREE.Mesh(nsRoadGeo, asphaltMat);
    nsRoad.position.set(0, 0.01, 0);
    nsRoad.receiveShadow = true;
    this.group.add(nsRoad);

    // East-West Road (14m wide)
    const ewRoadGeo = new THREE.PlaneGeometry(300, 14);
    ewRoadGeo.rotateX(-Math.PI / 2);
    this.geometries.push(ewRoadGeo);
    const ewRoad = new THREE.Mesh(ewRoadGeo, asphaltMat);
    ewRoad.position.set(0, 0.01, 0);
    ewRoad.receiveShadow = true;
    this.group.add(ewRoad);

    // Road Markings (Yellow center divider stripes and white crosswalks)
    this.buildRoadMarkings();
  }

  /**
   * Road divider stripes and crosswalk markings.
   */
  private buildRoadMarkings(): void {
    const yellowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.6,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.5,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    this.materials.push(yellowMat, whiteMat);

    // North & South yellow dashes
    for (let z = 22; z < 140; z += 6) {
      const dashGeo = new THREE.PlaneGeometry(0.35, 3.2);
      dashGeo.rotateX(-Math.PI / 2);
      this.geometries.push(dashGeo);

      const dashN = new THREE.Mesh(dashGeo, yellowMat);
      dashN.position.set(0, 0.02, -z);
      this.group.add(dashN);

      const dashS = new THREE.Mesh(dashGeo, yellowMat);
      dashS.position.set(0, 0.02, z);
      this.group.add(dashS);
    }

    // East & West yellow dashes
    for (let x = 22; x < 140; x += 6) {
      const dashGeo = new THREE.PlaneGeometry(3.2, 0.35);
      dashGeo.rotateX(-Math.PI / 2);
      this.geometries.push(dashGeo);

      const dashE = new THREE.Mesh(dashGeo, yellowMat);
      dashE.position.set(x, 0.02, 0);
      this.group.add(dashE);

      const dashW = new THREE.Mesh(dashGeo, yellowMat);
      dashW.position.set(-x, 0.02, 0);
      this.group.add(dashW);
    }
  }

  /**
   * Iconic Gulshan Circle 2 Roundabout:
   * Circular roadway ring, raised curb, landscaped center, and Dhaka modernist monument.
   */
  private buildGulshanRoundabout(): void {
    // 1. Asphalt Roundabout Ring (Inner radius 12m, Outer radius 20m)
    const ringGeo = new THREE.RingGeometry(11.8, 19.8, 48);
    ringGeo.rotateX(-Math.PI / 2);
    this.geometries.push(ringGeo);

    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x181c22, // Rich dark asphalt
      roughness: 0.85,
    });
    this.materials.push(asphaltMat);

    const ringMesh = new THREE.Mesh(ringGeo, asphaltMat);
    ringMesh.position.y = 0.015;
    ringMesh.receiveShadow = true;
    this.group.add(ringMesh);

    // 2. Central Island Curb (Radius 11.8m, Height 0.45m)
    const curbGeo = new THREE.CylinderGeometry(11.5, 11.8, 0.45, 48);
    this.geometries.push(curbGeo);
    const curbMat = new THREE.MeshStandardMaterial({
      color: 0x64748b, // Concrete curb
      roughness: 0.8,
    });
    this.materials.push(curbMat);

    const curbMesh = new THREE.Mesh(curbGeo, curbMat);
    curbMesh.position.set(0, 0.225, 0);
    curbMesh.receiveShadow = true;
    this.group.add(curbMesh);

    // Lush manicured green grass lawn inside roundabout circle
    const lawnGeo = new THREE.CylinderGeometry(11.3, 11.3, 0.05, 48);
    this.geometries.push(lawnGeo);
    const lawnMat = new THREE.MeshStandardMaterial({
      color: 0x1e6f38, // Tropical garden grass
      roughness: 0.9,
      metalness: 0.05,
    });
    this.materials.push(lawnMat);
    const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
    lawnMesh.position.set(0, 0.46, 0);
    lawnMesh.receiveShadow = true;
    this.group.add(lawnMesh);

    // 3. Central Monument Group (Bengali modernist architectural sculpture)
    const monumentGroup = new THREE.Group();
    monumentGroup.position.set(0, 0.45, 0);

    // Stepped plinth
    const plinthGeo = new THREE.CylinderGeometry(5.0, 5.5, 0.6, 24);
    this.geometries.push(plinthGeo);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
    this.materials.push(plinthMat);
    const plinth = new THREE.Mesh(plinthGeo, plinthMat);
    plinth.position.y = 0.3;
    monumentGroup.add(plinth);

    // 3 Curved concrete spires representing progress and heritage
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3;
      const spireGeo = new THREE.BoxGeometry(0.8, 9.5, 2.2);
      this.geometries.push(spireGeo);
      const spireMat = new THREE.MeshStandardMaterial({
        color: 0xe2e8f0,
        roughness: 0.35,
        metalness: 0.25,
      });
      this.materials.push(spireMat);

      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(Math.cos(angle) * 2.2, 5.0, Math.sin(angle) * 2.2);
      spire.rotation.y = angle;
      spire.castShadow = true;
      monumentGroup.add(spire);
    }

    // Central illuminated glass crystal
    const crystalGeo = new THREE.OctahedronGeometry(1.6);
    this.geometries.push(crystalGeo);
    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.6,
      roughness: 0.1,
      metalness: 0.9,
    });
    this.materials.push(crystalMat);
    const crystal = new THREE.Mesh(crystalGeo, crystalMat);
    crystal.position.y = 4.5;
    monumentGroup.add(crystal);

    this.group.add(monumentGroup);

    // Register Roundabout Monument Collider (Radius ~5m)
    this.colliders.push({
      min: { x: -5.5, y: 0, z: -5.5 },
      max: { x: 5.5, y: 10, z: 5.5 },
    });
  }

  /**
   * Assembles high-detail composite buildings adhering to Three.js 3-12 part rules.
   */
  private buildBuildings(): void {
    DHAKA_GULSHAN2_BUILDINGS.forEach((data) => {
      const buildingGroup = this.createCompositeBuilding(data);
      this.group.add(buildingGroup);
    });
  }

  /**
   * Creates a 3–12 part composite building with primary silhouette,
   * secondary read (window columns, balconies, rooftop parapet),
   * and accent details (Bengali neon signage, rooftop water tank, antenna).
   */
  private createCompositeBuilding(b: BuildingData): THREE.Group {
    const group = new THREE.Group();
    group.name = `Building_${b.id}`;
    group.position.set(b.position.x, 0, b.position.z);

    // 1. Primary Silhouette: Main Tower Core
    const coreGeo = new THREE.BoxGeometry(b.width, b.height, b.depth);
    this.geometries.push(coreGeo);

    // Create procedural facade texture with window grid and concrete texture
    const facadeTexture = this.generateFacadeTexture(b.color, b.accentColor, b.floors);
    this.textures.push(facadeTexture);

    const coreMat = new THREE.MeshStandardMaterial({
      map: facadeTexture,
      roughness: 0.7,
      metalness: 0.2,
    });
    this.materials.push(coreMat);

    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    coreMesh.position.y = b.height / 2; // Pivot grounded at Y=0
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    group.add(coreMesh);

    // 2. Secondary Read: Ground-floor Commercial Base / Portico
    const baseGeo = new THREE.BoxGeometry(b.width + 1.2, 4.5, b.depth + 1.2);
    this.geometries.push(baseGeo);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e242b,
      roughness: 0.5,
      metalness: 0.3,
    });
    this.materials.push(baseMat);
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 2.25;
    group.add(baseMesh);

    // 3. Secondary Read: Rooftop Parapet Perimeter
    const parapetGeo = new THREE.BoxGeometry(b.width + 0.4, 1.2, b.depth + 0.4);
    this.geometries.push(parapetGeo);
    const parapetMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.8,
    });
    this.materials.push(parapetMat);
    const parapetMesh = new THREE.Mesh(parapetGeo, parapetMat);
    parapetMesh.position.y = b.height + 0.6;
    group.add(parapetMesh);

    // 4. Accent Detail: Dhaka Cylindrical Rooftop Water Reserve Tank
    if (b.hasRooftopWaterTank) {
      const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 2.8, 16);
      this.geometries.push(tankGeo);
      const tankMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7, // Classic blue poly tank common across Dhaka rooftops
        roughness: 0.4,
        metalness: 0.1,
      });
      this.materials.push(tankMat);
      const tank = new THREE.Mesh(tankGeo, tankMat);
      tank.position.set(-b.width * 0.25, b.height + 2.0, b.depth * 0.2);
      tank.castShadow = true;
      group.add(tank);
    }

    // 5. Accent Detail: Communication Transmission Antenna
    const antennaGeo = new THREE.CylinderGeometry(0.12, 0.25, 7.0, 8);
    this.geometries.push(antennaGeo);
    const antennaMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      metalness: 0.8,
    });
    this.materials.push(antennaMat);
    const antenna = new THREE.Mesh(antennaGeo, antennaMat);
    antenna.position.set(b.width * 0.3, b.height + 4.5, -b.depth * 0.25);
    group.add(antenna);

    // 6. Accent Detail: Bilingual Bengali Commercial Signboard
    if (b.hasBengaliSign) {
      const signMesh = this.createStorefrontSign(b.name, b.bengaliName, b.accentColor, b.width * 0.75);
      signMesh.position.set(0, 4.6, b.depth / 2 + 0.7);
      group.add(signMesh);
    }

    return group;
  }

  /**
   * Procedural canvas texture generator for architectural facades with illuminated windows.
   */
  private generateFacadeTexture(baseColorHex: number, accentHex: number, floors: number): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Concrete background
    ctx.fillStyle = `#${baseColorHex.toString(16).padStart(6, '0')}`;
    ctx.fillRect(0, 0, 512, 1024);

    // Subtle texture noise / concrete panels
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = 0; y < 1024; y += 40) {
      ctx.fillRect(0, y, 512, 2);
    }

    // Windows Grid
    const cols = 6;
    const windowWidth = 45;
    const windowHeight = 60;
    const colSpacing = (512 - cols * windowWidth) / (cols + 1);
    const floorHeight = 1024 / floors;

    for (let f = 1; f < floors; f++) {
      const y = 1024 - (f + 0.75) * floorHeight;
      for (let c = 0; c < cols; c++) {
        const x = colSpacing + c * (windowWidth + colSpacing);

        // Random window illumination (warm interior glow or cool glass reflection)
        const isLit = (f * 7 + c * 13) % 5 === 0;
        if (isLit) {
          ctx.fillStyle = 'rgba(254, 240, 138, 0.85)'; // Warm light
        } else {
          ctx.fillStyle = 'rgba(30, 41, 59, 0.75)'; // Dark glass
        }
        ctx.fillRect(x, y, windowWidth, windowHeight);

        // Window frame
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, windowWidth, windowHeight);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates bilingual Dhaka commercial storefront signboard with glowing neon typography.
   */
  private createStorefrontSign(
    englishText: string,
    bengaliText: string,
    accentHex: number,
    width: number
  ): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;

    // Sign background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 128);

    // Neon accent border
    const accentCss = `#${accentHex.toString(16).padStart(6, '0')}`;
    ctx.strokeStyle = accentCss;
    ctx.lineWidth = 6;
    ctx.strokeRect(4, 4, 504, 120);

    // Bengali Typography
    ctx.fillStyle = accentCss;
    ctx.font = 'bold 36px "Segoe UI", Tahoma, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bengaliText, 256, 52);

    // English Subtitle
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "Segoe UI", Tahoma, sans-serif';
    ctx.fillText(englishText.toUpperCase(), 256, 96);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    this.textures.push(texture);

    const signGeo = new THREE.PlaneGeometry(width, 2.2);
    this.geometries.push(signGeo);

    const signMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.3,
      metalness: 0.1,
      emissive: new THREE.Color(accentHex),
      emissiveIntensity: 0.35,
    });
    this.materials.push(signMat);

    return new THREE.Mesh(signGeo, signMat);
  }

  /**
   * Streetlights along Gulshan Avenue & Kamal Ataturk Avenue.
   */
  private buildStreetlights(): void {
    DHAKA_STREETLIGHTS.forEach((sl) => {
      const poleGroup = new THREE.Group();
      poleGroup.position.set(sl.position.x, 0, sl.position.z);
      poleGroup.rotation.y = sl.rotationY;

      // Vertical pole
      const poleGeo = new THREE.CylinderGeometry(0.12, 0.16, 7.0, 8);
      this.geometries.push(poleGeo);
      const poleMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
      this.materials.push(poleMat);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.y = 3.5;
      poleGroup.add(pole);

      // Arm extending over road
      const armGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8);
      armGeo.rotateZ(Math.PI / 3);
      this.geometries.push(armGeo);
      const arm = new THREE.Mesh(armGeo, poleMat);
      arm.position.set(0.9, 6.8, 0);
      poleGroup.add(arm);

      // Glowing LED lantern head
      const lampGeo = new THREE.BoxGeometry(0.6, 0.2, 0.3);
      this.geometries.push(lampGeo);
      const lampMat = new THREE.MeshStandardMaterial({
        color: 0xffedd5,
        emissive: 0xfef08a,
        emissiveIntensity: 1.0,
      });
      this.materials.push(lampMat);
      const lamp = new THREE.Mesh(lampGeo, lampMat);
      lamp.position.set(1.8, 6.5, 0);
      poleGroup.add(lamp);

      this.group.add(poleGroup);
    });
  }

  /**
   * Tropical trees placed on sidewalk verges.
   */
  private buildTrees(): void {
    const trunkGeo = new THREE.CylinderGeometry(0.25, 0.4, 4.0, 8);
    this.geometries.push(trunkGeo);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x452b1f, roughness: 0.9 });
    this.materials.push(trunkMat);

    const foliageGeo = new THREE.DodecahedronGeometry(2.4);
    this.geometries.push(foliageGeo);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x15803d, // Lush tropical green
      roughness: 0.8,
      metalness: 0.05,
    });
    this.materials.push(foliageMat);

    DHAKA_TREES.forEach((tree) => {
      const treeGroup = new THREE.Group();
      treeGroup.position.set(tree.position.x, 0, tree.position.z);
      treeGroup.scale.setScalar(tree.scale);

      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 2.0;
      trunk.castShadow = true;
      treeGroup.add(trunk);

      // Multi-layer tropical canopy
      const foliage1 = new THREE.Mesh(foliageGeo, foliageMat);
      foliage1.position.y = 4.8;
      foliage1.castShadow = true;
      treeGroup.add(foliage1);

      const foliage2 = new THREE.Mesh(foliageGeo, foliageMat);
      foliage2.position.set(0.6, 6.0, -0.4);
      foliage2.scale.setScalar(0.75);
      foliage2.castShadow = true;
      treeGroup.add(foliage2);

      this.group.add(treeGroup);
    });
  }

  /**
   * Loads modular Kenney road models into intersection positions.
   */
  private loadModularRoadAssets(loader: GLTFLoader): void {
    loader.load(
      '/assets/models/road-intersection.glb',
      (gltf) => {
        const intersection = gltf.scene;
        intersection.scale.set(7, 1, 7);
        intersection.position.set(0, 0.02, 0); // At central node
        this.group.add(intersection);
      },
      undefined,
      () => {
        // Fallback procedural geometry already active; gracefully continues
      }
    );
  }

  public dispose(): void {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.textures.forEach((t) => t.dispose());
    this.geometries = [];
    this.materials = [];
    this.textures = [];
  }
}
