/**
 * Pure Navigation Graph for Dhaka Traffic and Pedestrians in Project Apex V2.
 * Solves V1 bug: vehicles and NPCs moving in straight lines through buildings.
 */

import { Vec3, distance, distanceSq, normalize } from '../physics/math.ts';

export interface NavNode {
  id: string;
  position: Vec3;
  connections: string[]; // IDs of connected next nodes
  type: 'road' | 'sidewalk' | 'intersection';
  speedLimit?: number; // m/s
}

export interface NavGraph {
  nodes: Record<string, NavNode>;
}

/**
 * Creates the Gulshan-2 navigation graph for traffic and pedestrians.
 */
export function createGulshanNavGraph(): NavGraph {
  const nodes: Record<string, NavNode> = {
    // North Arterial (Gulshan Ave North towards Baridhara)
    'N1': { id: 'N1', position: { x: 0, y: 0, z: -100 }, connections: ['N2'], type: 'road' },
    'N2': { id: 'N2', position: { x: 0, y: 0, z: -50 }, connections: ['ROUNDABOUT_N'], type: 'road' },
    
    // South Arterial (Gulshan Ave South towards Gulshan 1)
    'S1': { id: 'S1', position: { x: 0, y: 0, z: 50 }, connections: ['S2'], type: 'road' },
    'S2': { id: 'S2', position: { x: 0, y: 0, z: 100 }, connections: ['S1'], type: 'road' },

    // East Arterial (Kamal Ataturk Ave East)
    'E1': { id: 'E1', position: { x: 50, y: 0, z: 0 }, connections: ['E2'], type: 'road' },
    'E2': { id: 'E2', position: { x: 100, y: 0, z: 0 }, connections: ['E1'], type: 'road' },

    // West Arterial (Kamal Ataturk Ave West towards Banani)
    'W1': { id: 'W1', position: { x: -50, y: 0, z: 0 }, connections: ['W2'], type: 'road' },
    'W2': { id: 'W2', position: { x: -100, y: 0, z: 0 }, connections: ['W1'], type: 'road' },

    // Central Gulshan 2 Roundabout ring nodes
    'ROUNDABOUT_N': { id: 'ROUNDABOUT_N', position: { x: 0, y: 0, z: -18 }, connections: ['ROUNDABOUT_E', 'W1'], type: 'intersection' },
    'ROUNDABOUT_E': { id: 'ROUNDABOUT_E', position: { x: 18, y: 0, z: 0 }, connections: ['ROUNDABOUT_S', 'E1'], type: 'intersection' },
    'ROUNDABOUT_S': { id: 'ROUNDABOUT_S', position: { x: 0, y: 0, z: 18 }, connections: ['ROUNDABOUT_W', 'S1'], type: 'intersection' },
    'ROUNDABOUT_W': { id: 'ROUNDABOUT_W', position: { x: -18, y: 0, z: 0 }, connections: ['ROUNDABOUT_N', 'N1'], type: 'intersection' },
  };

  return { nodes };
}

/**
 * Finds the closest nav node in the graph to a given position.
 */
export function findClosestNavNode(graph: NavGraph, pos: Vec3, typeFilter?: 'road' | 'sidewalk'): NavNode | null {
  let closest: NavNode | null = null;
  let minDistSq = Infinity;

  for (const id in graph.nodes) {
    const node = graph.nodes[id];
    if (typeFilter && node.type !== typeFilter && node.type !== 'intersection') {
      continue;
    }
    const dSq = distanceSq(pos, node.position);
    if (dSq < minDistSq) {
      minDistSq = dSq;
      closest = node;
    }
  }

  return closest;
}

/**
 * Gets next waypoint in path for traffic or pedestrian agent.
 */
export function getNextWaypoint(graph: NavGraph, currentNodeId: string): NavNode | null {
  const current = graph.nodes[currentNodeId];
  if (!current || current.connections.length === 0) return null;

  // Pick connected node
  const nextId = current.connections[Math.floor(Math.random() * current.connections.length)];
  return graph.nodes[nextId] || null;
}
