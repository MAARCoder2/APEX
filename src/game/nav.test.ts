import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createGulshanNavGraph,
  findClosestNavNode,
  getNextWaypoint,
} from './world/navGraph.ts';

test('nav graph constructs connected arterial roads and roundabout nodes', () => {
  const graph = createGulshanNavGraph();
  assert.ok(graph.nodes['N1']);
  assert.ok(graph.nodes['ROUNDABOUT_N']);
  assert.ok(graph.nodes['ROUNDABOUT_N'].connections.length > 0);
});

test('findClosestNavNode returns closest road waypoint', () => {
  const graph = createGulshanNavGraph();
  const testPos = { x: 2, y: 0, z: -98 };
  const closest = findClosestNavNode(graph, testPos, 'road');

  assert.ok(closest);
  assert.equal(closest.id, 'N1');
});

test('getNextWaypoint returns a connected next node', () => {
  const graph = createGulshanNavGraph();
  const nextNode = getNextWaypoint(graph, 'N1');

  assert.ok(nextNode);
  assert.equal(nextNode.id, 'N2');
});
