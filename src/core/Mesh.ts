import { Vec3 } from "../math/vec3";
import { MeshData, Polygon } from "../io/meshLoader";

/**
 * Mesh holds immutable geometry: local-space vertices (3D positions),
 * polygons (each lists vertex indices; renderer draws 1-2, 2-3, ..., n-1), and bounding radius.
 */
export class Mesh {
  readonly vertices: Vec3[];
  readonly polygons: Polygon[];
  readonly boundingRadius: number;

  constructor(vertices: Vec3[], polygons: Polygon[] = []) {
    this.vertices = vertices;
    this.polygons = polygons;
    this.boundingRadius = Mesh.computeBoundingRadius(vertices);
  }

  /**
   * Create a Mesh from loaded mesh data (e.g. from JSON).
   */
  static fromData(data: MeshData): Mesh {
    return new Mesh(data.vertices, data.polygons);
  }

  /**
   * Bounding radius = max distance from origin to any vertex in local space.
   */
  static computeBoundingRadius(vertices: Vec3[]): number {
    let maxSq = 0;
    for (const v of vertices) {
      const sq = v.lengthSq();
      if (sq > maxSq) maxSq = sq;
    }
    return Math.sqrt(maxSq);
  }
}
