import { Vec3 } from "../math/vec3";
import { MeshData } from "../io/meshLoader";

/**
 * Mesh holds immutable geometry: local-space points, edges (vertices),
 * and a precomputed bounding radius for culling.
 */
export class Mesh {
  readonly points: Vec3[];
  readonly vertices: [number, number][];
  readonly boundingRadius: number;

  constructor(points: Vec3[], vertices: [number, number][]) {
    this.points = points;
    this.vertices = vertices;
    this.boundingRadius = Mesh.computeBoundingRadius(points);
  }

  /**
   * Create a Mesh from loaded mesh data (e.g. from JSON).
   */
  static fromData(data: MeshData): Mesh {
    return new Mesh(data.points, data.vertices);
  }

  /**
   * Bounding radius = max distance from origin to any point in local space.
   */
  static computeBoundingRadius(points: Vec3[]): number {
    let maxSq = 0;
    for (const p of points) {
      const sq = p.lengthSq();
      if (sq > maxSq) maxSq = sq;
    }
    return Math.sqrt(maxSq);
  }
}

