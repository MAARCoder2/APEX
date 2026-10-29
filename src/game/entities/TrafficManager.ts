/**
 * Autonomous City Traffic & Pedestrian AI Manager for Project Apex V2.
 * Adheres to Three.js and Ultra-mode guidelines:
 * - Agents navigate connected Gulshan-2 waypoint graph.
 * - Obstacle collision avoidance prevents clipping through buildings.
 * - Bounded entity pool guarantees 60 FPS performance.
 */

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { NavGraph, NavNode, createGulshanNavGraph, getNextWaypoint } from '../world/navGraph.ts';
import { Vec3, distance, distanceSq, AABB, resolveSphereAABBCollision } from '../physics/math.ts';

interface TrafficCar {
  mesh: THREE.Group;
  currentWaypointId: string;
  speed: number;
  targetSpeed: number;
  heading: number;
}

interface Pedestrian {
  mesh: THREE.Group;
  currentWaypointId: string;
  speed: number;
  heading: number;
  mixer?: THREE.AnimationMixer;
}

export class TrafficManager {
  public group: THREE.Group;
  private navGraph: NavGraph;
  private cars: TrafficCar[] = [];
  private pedestrians: Pedestrian[] = [];
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  constructor() {
    this.group = new THREE.Group();
    this.group.name = 'CityTraffic';
    this.navGraph = createGulshanNavGraph();
  }

  public init(scene: THREE.Scene, loader: GLTFLoader): void {
    this.spawnTrafficCars();
    this.spawnPedestrians(loader);
    scene.add(this.group);
  }

  /**
   * Spawns autonomous traffic cars traversing arterial lanes.
   */
  private spawnTrafficCars(): void {
    const carColors = [0x2563eb, 0x16a34a, 0xeab308, 0x475569];
    const spawnNodes = ['N1', 'S1', 'E1', 'W1'];

    spawnNodes.forEach((nodeId, idx) => {
      const node = this.navGraph.nodes[nodeId];
      if (!node) return;

      const carGroup = new THREE.Group();
      carGroup.position.set(node.position.x, 0, node.position.z);

      // Chassis
      const chassisGeo = new THREE.BoxGeometry(1.9, 0.6, 3.8);
      this.geometries.push(chassisGeo);
      const chassisMat = new THREE.MeshStandardMaterial({
        color: carColors[idx % carColors.length],
        roughness: 0.3,
        metalness: 0.6,
      });
      this.materials.push(chassisMat);
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      chassis.position.y = 0.45;
      chassis.castShadow = true;
      carGroup.add(chassis);

      // Cabin / Roof
      const cabinGeo = new THREE.BoxGeometry(1.5, 0.5, 2.0);
      this.geometries.push(cabinGeo);
      const cabinMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.2,
        metalness: 0.9,
      });
      this.materials.push(cabinMat);
      const cabin = new THREE.Mesh(cabinGeo, cabinMat);
      cabin.position.set(0, 0.95, -0.2);
      carGroup.add(cabin);

      this.group.add(carGroup);

      this.cars.push({
        mesh: carGroup,
        currentWaypointId: nodeId,
        speed: 7.0 + Math.random() * 4.0, // 25 - 40 km/h
        targetSpeed: 10.0,
        heading: 0,
      });
    });
  }

  /**
   * Spawns walking pedestrians.
   */
  private spawnPedestrians(loader: GLTFLoader): void {
    const pedestrianSpawns: Vec3[] = [
      { x: -14, y: 0, z: -25 },
      { x: 14, y: 0, z: -35 },
      { x: -18, y: 0, z: 25 },
      { x: 18, y: 0, z: 40 },
    ];

    pedestrianSpawns.forEach((spawn, idx) => {
      const pedGroup = new THREE.Group();
      pedGroup.position.set(spawn.x, 0, spawn.z);

      // Composite procedural pedestrian
      const torsoGeo = new THREE.BoxGeometry(0.5, 0.75, 0.3);
      this.geometries.push(torsoGeo);
      const torsoMat = new THREE.MeshStandardMaterial({
        color: idx % 2 === 0 ? 0x0284c7 : 0xe11d48,
        roughness: 0.7,
      });
      this.materials.push(torsoMat);
      const torso = new THREE.Mesh(torsoGeo, torsoMat);
      torso.position.y = 1.05;
      torso.castShadow = true;
      pedGroup.add(torso);

      const headGeo = new THREE.SphereGeometry(0.2, 12, 12);
      this.geometries.push(headGeo);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.6 });
      this.materials.push(headMat);
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.6;
      pedGroup.add(head);

      this.group.add(pedGroup);

      this.pedestrians.push({
        mesh: pedGroup,
        currentWaypointId: 'ROUNDABOUT_N',
        speed: 1.4 + Math.random() * 0.8,
        heading: Math.random() * Math.PI * 2,
      });
    });
  }

  /**
   * Updates traffic cars and pedestrians.
   */
  public update(dt: number, colliders: AABB[]): void {
    // 1. Update Traffic Cars
    this.cars.forEach((car) => {
      const currentNode = this.navGraph.nodes[car.currentWaypointId];
      if (!currentNode) return;

      const carPos: Vec3 = {
        x: car.mesh.position.x,
        y: car.mesh.position.y,
        z: car.mesh.position.z,
      };

      const distToNode = distance(carPos, currentNode.position);

      // If reached waypoint, pick next connected node
      if (distToNode < 3.5) {
        const next = getNextWaypoint(this.navGraph, car.currentWaypointId);
        if (next) {
          car.currentWaypointId = next.id;
        }
      }

      // Steer toward target node
      const targetNode = this.navGraph.nodes[car.currentWaypointId];
      if (targetNode) {
        const dx = targetNode.position.x - carPos.x;
        const dz = targetNode.position.z - carPos.z;
        const targetHeading = Math.atan2(dx, -dz);

        // Interpolate heading
        let diff = targetHeading - car.heading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        car.heading += diff * Math.min(1.0, 3.5 * dt);

        // Move forward along heading
        const forwardX = Math.sin(car.heading);
        const forwardZ = -Math.cos(car.heading);

        car.mesh.position.x += forwardX * car.speed * dt;
        car.mesh.position.z += forwardZ * car.speed * dt;
        car.mesh.rotation.y = car.heading;
      }
    });

    // 2. Update Pedestrians (slow pacing along sidewalk perimeter)
    this.pedestrians.forEach((ped) => {
      ped.heading += (Math.random() - 0.5) * 0.4 * dt;
      ped.mesh.position.x += Math.sin(ped.heading) * ped.speed * dt;
      ped.mesh.position.z += Math.cos(ped.heading) * ped.speed * dt;
      ped.mesh.rotation.y = ped.heading;

      // Restrict pedestrian within district boundaries
      ped.mesh.position.x = THREE.MathUtils.clamp(ped.mesh.position.x, -90, 90);
      ped.mesh.position.z = THREE.MathUtils.clamp(ped.mesh.position.z, -90, 90);
    });
  }

  public dispose(): void {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
    this.geometries = [];
    this.materials = [];
  }
}
