import { Vec3 } from "../math/vec3";
import { Mat4 } from "../math/mat4";
import { projectPoint, Viewport } from "../math/projection";
import { isSphereInFrustum } from "../math/frustum";
import { Scene } from "./Scene";
import type { Polygon } from "../io/meshLoader";

/** Geometry that has vertices and polygons (Mesh or MeshData). */
export interface MeshLike {
  vertices: Vec3[];
  polygons: Polygon[];
}

/** A batch of line segments drawn in a single color (e.g. one polygon's wireframe). */
export interface ColoredSegmentBatch {
  color: string;
  segments: Array<[number, number, number, number]>;
}

/**
 * Project all mesh vertices to screen space using the MVP matrix.
 * Returns an array where each element is either a Vec3 (screen coordinates)
 * or null if the vertex is behind the camera or invalid.
 */
export function projectMeshVertices(
  mesh: MeshLike,
  mvp: Mat4,
  viewport: Viewport
): (Vec3 | null)[] {
  const projected: (Vec3 | null)[] = [];

  for (const vertex of mesh.vertices) {
    const p = projectPoint(vertex, mvp, viewport);
    if (p && !p.behind) {
      projected.push(new Vec3(p.x, p.y, 0));
    } else {
      projected.push(null);
    }
  }

  return projected;
}

/**
 * Build wireframe segments for a single polygon from projected vertices.
 * Draws lines between consecutive vertex indices, then last back to first.
 * Returns the segments, or null if any polygon vertex is invalid or behind.
 */
export function collectPolygonSegments(
  projectedVertices: (Vec3 | null)[],
  polygon: Polygon
): Array<[number, number, number, number]> | null {
  const indices = polygon.vertexIndices;
  if (indices.length < 2) return [];

  const segments: Array<[number, number, number, number]> = [];

  for (let i = 0; i < indices.length; i++) {
    const idxA = indices[i];
    const idxB = indices[(i + 1) % indices.length];
    const vA = projectedVertices[idxA];
    const vB = projectedVertices[idxB];

    if (!vA || !vB) return null;
    segments.push([vA.x, vA.y, vB.x, vB.y]);
  }

  return segments;
}

/**
 * Project the whole scene to screen-space wireframe per polygon.
 * Each object (after frustum culling) is rendered by polygon: for each polygon,
 * project its vertex indices; draw lines 1-2, 2-3, ..., n-1 (last back to first).
 * Returns batches of segments with color for drawing.
 */
export function projectSceneToPolygonWireframe(
  scene: Scene,
  viewProj: Mat4,
  viewport: Viewport
): ColoredSegmentBatch[] {
  const batches: ColoredSegmentBatch[] = [];
  const camera = scene.camera;
  const view = camera.getViewMatrix();
  const aspect = viewport.width / viewport.height;

  for (const object of scene.objects) {
    const mesh = object.mesh;
    const worldCenter = object.position;
    const worldRadius =
      mesh.boundingRadius *
      Math.max(object.scale.x, object.scale.y, object.scale.z);

    if (
      !isSphereInFrustum(
        worldCenter,
        worldRadius,
        view,
        camera.fovYRad,
        aspect,
        camera.near,
        camera.far
      )
    ) {
      continue;
    }

    const model = object.getModelMatrix();
    const mvp = viewProj.multiply(model);
    const projectedVertices = projectMeshVertices(mesh, mvp, viewport);

    for (const polygon of mesh.polygons) {
      const segments = collectPolygonSegments(projectedVertices, polygon);
      if (segments !== null && segments.length > 0) {
        batches.push({ color: polygon.color, segments });
      }
    }
  }

  return batches;
}
