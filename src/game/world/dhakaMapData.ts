/**
 * Geographically grounded map data for Dhaka Gulshan-2 District in Project Apex V2.
 * Based on OpenStreetMap contributors data (ODbL 1.0).
 * Origin (0, 0, 0) is centered at Gulshan Circle 2 Roundabout.
 */

import { AABB, Vec3 } from '../physics/math.ts';

export interface BuildingData {
  id: string;
  name: string;
  bengaliName: string;
  position: Vec3;
  width: number;
  depth: number;
  height: number;
  floors: number;
  color: number;
  accentColor: number;
  hasBengaliSign?: boolean;
  hasRooftopWaterTank?: boolean;
}

export interface TreeData {
  position: Vec3;
  scale: number;
}

export interface StreetlightData {
  position: Vec3;
  rotationY: number;
}

export const DHAKA_GULSHAN2_BUILDINGS: BuildingData[] = [
  // Northwest Quadrant (Kamal Ataturk Ave West / Gulshan Ave North)
  {
    id: 'bldg-nw-1',
    name: 'Apex Commercial Tower',
    bengaliName: 'অ্যাপেক্স কমার্শিয়াল টাওয়ার',
    position: { x: -35, y: 0, z: -45 },
    width: 24,
    depth: 26,
    height: 48,
    floors: 14,
    color: 0x2b3848,
    accentColor: 0x38bdf8,
    hasBengaliSign: true,
    hasRooftopWaterTank: true,
  },
  {
    id: 'bldg-nw-2',
    name: 'Gulshan Shopping Complex',
    bengaliName: 'গুলশান শপিং কমপ্লেক্স',
    position: { x: -75, y: 0, z: -40 },
    width: 32,
    depth: 22,
    height: 28,
    floors: 8,
    color: 0x3d3944,
    accentColor: 0xf59e0b,
    hasBengaliSign: true,
  },
  {
    id: 'bldg-nw-3',
    name: 'Bengal Art & Cafe',
    bengaliName: 'বেঙ্গল আর্ট লাউঞ্জ ও ক্যাফে',
    position: { x: -35, y: 0, z: -85 },
    width: 20,
    depth: 24,
    height: 22,
    floors: 6,
    color: 0x4a433e,
    accentColor: 0x10b981,
    hasBengaliSign: true,
    hasRooftopWaterTank: true,
  },

  // Northeast Quadrant (Gulshan Ave North / Baridhara Diplomatic link)
  {
    id: 'bldg-ne-1',
    name: 'The Westin Dhaka District',
    bengaliName: 'ওয়েস্টিন ঢাকা এরিয়া',
    position: { x: 38, y: 0, z: -48 },
    width: 28,
    depth: 28,
    height: 54,
    floors: 16,
    color: 0x273444,
    accentColor: 0x60a5fa,
    hasBengaliSign: true,
    hasRooftopWaterTank: true,
  },
  {
    id: 'bldg-ne-2',
    name: 'Bank Asia Corporate Center',
    bengaliName: 'ব্যাংক এশিয়া করপোরেট',
    position: { x: 80, y: 0, z: -42 },
    width: 26,
    depth: 24,
    height: 36,
    floors: 10,
    color: 0x384152,
    accentColor: 0xef4444,
    hasBengaliSign: true,
  },
  {
    id: 'bldg-ne-3',
    name: 'Gulshan Lakefront Suites',
    bengaliName: 'লেকফ্রন্ট রেসিডেন্স',
    position: { x: 42, y: 0, z: -92 },
    width: 24,
    depth: 28,
    height: 38,
    floors: 11,
    color: 0x403e47,
    accentColor: 0xa855f7,
    hasRooftopWaterTank: true,
  },

  // Southwest Quadrant (Kamal Ataturk Ave West towards Banani / Road 11)
  {
    id: 'bldg-sw-1',
    name: 'Pink City Shopping Mall',
    bengaliName: 'পিংক সিটি শপিং মল',
    position: { x: -40, y: 0, z: 45 },
    width: 30,
    depth: 26,
    height: 32,
    floors: 9,
    color: 0x47333d,
    accentColor: 0xf43f5e,
    hasBengaliSign: true,
  },
  {
    id: 'bldg-sw-2',
    name: 'Road 11 Safehouse & Courier Depot',
    bengaliName: 'রোড ১১ কুরিয়ার ও সেফহাউস',
    position: { x: -65, y: 0, z: 58 },
    width: 22,
    depth: 22,
    height: 20,
    floors: 5,
    color: 0x3f4638,
    accentColor: 0x22c55e,
    hasBengaliSign: true,
    hasRooftopWaterTank: true,
  },
  {
    id: 'bldg-sw-3',
    name: 'Dhanmondi-Gulshan Logistics',
    bengaliName: 'ডিজিটাল লজিস্টিকস',
    position: { x: -85, y: 0, z: 32 },
    width: 20,
    depth: 26,
    height: 24,
    floors: 7,
    color: 0x3a3d45,
    accentColor: 0xf59e0b,
  },

  // Southeast Quadrant (Gulshan Ave South towards Gulshan 1)
  {
    id: 'bldg-se-1',
    name: 'DCC Market Complex',
    bengaliName: 'ডিসিসি মার্কেট গুলশান ২',
    position: { x: 38, y: 0, z: 45 },
    width: 32,
    depth: 24,
    height: 26,
    floors: 7,
    color: 0x453d36,
    accentColor: 0x06b6d4,
    hasBengaliSign: true,
  },
  {
    id: 'bldg-se-2',
    name: 'Eastern Housing Plaza',
    bengaliName: 'ইস্টার্ন হাউজিং প্লাজা',
    position: { x: 80, y: 0, z: 48 },
    width: 26,
    depth: 26,
    height: 42,
    floors: 12,
    color: 0x313d4b,
    accentColor: 0x3b82f6,
    hasBengaliSign: true,
    hasRooftopWaterTank: true,
  },
  {
    id: 'bldg-se-3',
    name: 'Gulshan 2 Metro Clinic',
    bengaliName: 'মেট্রো হেলথ ক্লিনিক',
    position: { x: 40, y: 0, z: 90 },
    width: 22,
    depth: 24,
    height: 24,
    floors: 6,
    color: 0x424647,
    accentColor: 0x14b8a6,
    hasRooftopWaterTank: true,
  },
];

/**
 * Extracts static Axis-Aligned Bounding Box colliders for buildings.
 */
export function getDhakaBuildingColliders(): AABB[] {
  return DHAKA_GULSHAN2_BUILDINGS.map((b) => ({
    min: {
      x: b.position.x - b.width / 2,
      y: b.position.y,
      z: b.position.z - b.depth / 2,
    },
    max: {
      x: b.position.x + b.width / 2,
      y: b.position.y + b.height,
      z: b.position.z + b.depth / 2,
    },
  }));
}

/**
 * Streetlight coordinates along Kamal Ataturk Ave and Gulshan Ave.
 */
export const DHAKA_STREETLIGHTS: StreetlightData[] = [
  // North / South Gulshan Ave
  { position: { x: -7, y: 0, z: -35 }, rotationY: Math.PI / 2 },
  { position: { x: 7, y: 0, z: -35 }, rotationY: -Math.PI / 2 },
  { position: { x: -7, y: 0, z: -75 }, rotationY: Math.PI / 2 },
  { position: { x: 7, y: 0, z: -75 }, rotationY: -Math.PI / 2 },
  { position: { x: -7, y: 0, z: 35 }, rotationY: Math.PI / 2 },
  { position: { x: 7, y: 0, z: 35 }, rotationY: -Math.PI / 2 },
  { position: { x: -7, y: 0, z: 75 }, rotationY: Math.PI / 2 },
  { position: { x: 7, y: 0, z: 75 }, rotationY: -Math.PI / 2 },

  // East / West Kamal Ataturk Ave
  { position: { x: -35, y: 0, z: -7 }, rotationY: 0 },
  { position: { x: -35, y: 0, z: 7 }, rotationY: Math.PI },
  { position: { x: -75, y: 0, z: -7 }, rotationY: 0 },
  { position: { x: -75, y: 0, z: 7 }, rotationY: Math.PI },
  { position: { x: 35, y: 0, z: -7 }, rotationY: 0 },
  { position: { x: 35, y: 0, z: 7 }, rotationY: Math.PI },
  { position: { x: 75, y: 0, z: -7 }, rotationY: 0 },
  { position: { x: 75, y: 0, z: 7 }, rotationY: Math.PI },
];

/**
 * Tropical trees (Neem / Palm) placed along sidewalks and roundabout edge.
 */
export const DHAKA_TREES: TreeData[] = [
  { position: { x: -16, y: 0, z: -30 }, scale: 1.1 },
  { position: { x: 16, y: 0, z: -30 }, scale: 0.95 },
  { position: { x: -16, y: 0, z: 30 }, scale: 1.05 },
  { position: { x: 16, y: 0, z: 30 }, scale: 1.2 },
  { position: { x: -30, y: 0, z: -16 }, scale: 1.0 },
  { position: { x: -30, y: 0, z: 16 }, scale: 1.15 },
  { position: { x: 30, y: 0, z: -16 }, scale: 0.9 },
  { position: { x: 30, y: 0, z: 16 }, scale: 1.05 },
  // Roundabout center garden trees
  { position: { x: -4, y: 0, z: -4 }, scale: 0.85 },
  { position: { x: 4, y: 0, z: 4 }, scale: 0.9 },
  { position: { x: -4, y: 0, z: 4 }, scale: 0.85 },
  { position: { x: 4, y: 0, z: -4 }, scale: 0.8 },
];
