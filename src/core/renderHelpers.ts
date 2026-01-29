import { Vec3 } from "../math/vec3";
import { Vec4 } from "../math/vec4";
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

/** A drawable polygon batch with depth for Painter's algorithm (sort back-to-front). */
export interface DrawablePolygonBatch extends ColoredSegmentBatch {
  /** Camera-space z (negative in front of camera); used for depth sort (farthest first). */
  depth: number;
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
 * Transform mesh vertices to camera space (view * model).
 * Returns array of Vec3 (x, y, z) in camera space; z is negative in front of camera.
 */
function transformVerticesToCameraSpace(
  mesh: MeshLike,
  viewModel: Mat4
): Vec3[] {
  const out: Vec3[] = [];
  for (const v of mesh.vertices) {
    const c = viewModel.transformVec4(new Vec4(v.x, v.y, v.z, 1));
    out.push(new Vec3(c.x, c.y, c.z));
  }
  return out;
}

/**
 * Compute polygon depth for Painter's algorithm: average camera-space z of its vertices.
 * Smaller z = farther from camera (draw first).
 */
function polygonDepth(vertexIndices: number[], cameraSpaceVertices: Vec3[]): number {
  if (vertexIndices.length === 0) return 0;
  let sum = 0;
  for (const i of vertexIndices) {
    sum += cameraSpaceVertices[i].z;
  }
  return sum / vertexIndices.length;
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
 * Project the whole scene to screen-space wireframe per polygon, with depth for Painter's algorithm.
 * Each object (after frustum culling) is rendered by polygon: for each polygon,
 * project its vertex indices; draw lines 1-2, 2-3, ..., n-1 (last back to first).
 * Batches are sorted by depth (farthest first) so drawing order gives correct occlusion.
 * Returns sorted batches of segments with color for drawing back-to-front.
 */
export function projectSceneToPolygonWireframe(
  scene: Scene,
  viewProj: Mat4,
  viewport: Viewport
): ColoredSegmentBatch[] {
  const batches: DrawablePolygonBatch[] = [];
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
    const viewModel = view.multiply(model);
    const mvp = viewProj.multiply(model);
    const cameraSpaceVertices = transformVerticesToCameraSpace(mesh, viewModel);
    const projectedVertices = projectMeshVertices(mesh, mvp, viewport);

    for (const polygon of mesh.polygons) {
      const segments = collectPolygonSegments(projectedVertices, polygon);
      if (segments !== null && segments.length > 0) {
        const depth = polygonDepth(polygon.vertexIndices, cameraSpaceVertices);
        batches.push({ color: polygon.color, segments, depth });
      }
    }
  }

  // Painter's algorithm: sort by depth ascending (farthest first = smallest z)
  batches.sort((a, b) => a.depth - b.depth);

  return batches;
}
