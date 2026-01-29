import { Vec3 } from "../math/vec3";
import { MeshData, Polygon } from "../io/meshLoader";

/**
 * Mesh holds immutable geometry: local-space points, edges (vertices),
 * polygons (for per-polygon rendering and culling), and a precomputed bounding radius.
 */
export class Mesh {
  readonly points: Vec3[];
  readonly vertices: [number, number][];
  readonly polygons: Polygon[];
  readonly boundingRadius: number;

  constructor(
    points: Vec3[],
    vertices: [number, number][],
    polygons: Polygon[] = []
  ) {
    this.points = points;
    this.vertices = vertices;
    this.polygons = polygons;
    this.boundingRadius = Mesh.computeBoundingRadius(points);
  }

  /**
   * Create a Mesh from loaded mesh data (e.g. from JSON).
   */
  static fromData(data: MeshData): Mesh {
    return new Mesh(data.points, data.vertices, data.polygons);
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

