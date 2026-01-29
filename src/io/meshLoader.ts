import { Vec3 } from "../math/vec3";

export interface Polygon {
  color: string;
  vertexIndices: number[];
}

export interface MeshData {
  points: Vec3[];
  vertices: [number, number][];
  polygons: Polygon[];
}

export interface MeshJSON {
  points: Array<{ x: number; y: number; z: number }>;
  vertices: Array<[number, number]>;
  polygons?: Array<{
    color: string;
    vertexIndices: number[];
  }>;
}

/**
 * Load a mesh from a JSON file.
 * For now, we only load points and vertices (edges) for wireframe rendering.
 */
export async function loadMesh(url: string): Promise<MeshData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load mesh from ${url}: ${response.statusText}`);
  }

  const json: MeshJSON = await response.json();

  // Convert points to Vec3 array
  const points = json.points.map((p) => new Vec3(p.x, p.y, p.z));

  // Vertices are already in the right format [indexA, indexB][]
  const vertices: [number, number][] = json.vertices;

  // Polygons (optional in JSON; default to empty for wireframe-only meshes)
  const polygons: Polygon[] = json.polygons ?? [];

  return {
    points,
    vertices,
    polygons,
  };
}
