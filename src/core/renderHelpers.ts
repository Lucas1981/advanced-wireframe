import { Vec3 } from "../math/vec3";
import { Mat4 } from "../math/mat4";
import { projectPoint, Viewport } from "../math/projection";
import { isSphereInFrustum } from "../math/frustum";
import { Scene } from "./Scene";

/** Geometry that has points and vertices (Mesh or MeshData). */
export interface MeshLike {
  points: Vec3[];
  vertices: [number, number][];
}

/**
 * Project all mesh points to screen space using the MVP matrix.
 * Returns an array where each element is either a Vec3 (screen coordinates)
 * or null if the point is behind the camera or invalid.
 */
export function projectMeshPoints(
  mesh: MeshLike,
  mvp: Mat4,
  viewport: Viewport
): (Vec3 | null)[] {
  const projectedPoints: (Vec3 | null)[] = [];

  for (const point of mesh.points) {
    const projected = projectPoint(point, mvp, viewport);
    if (projected && !projected.behind) {
      projectedPoints.push(new Vec3(projected.x, projected.y, 0));
    } else {
      projectedPoints.push(null);
    }
  }

  return projectedPoints;
}

/**
 * Collect line segments from projected points and mesh vertices.
 * Returns an array of line segments: [[x1, y1, x2, y2], ...]
 * Only includes segments where both endpoints are valid and visible.
 */
export function collectLineSegments(
  projectedPoints: (Vec3 | null)[],
  vertices: [number, number][]
): Array<[number, number, number, number]> {
  const lineSegments: Array<[number, number, number, number]> = [];

  for (const [indexA, indexB] of vertices) {
    const pointA = projectedPoints[indexA];
    const pointB = projectedPoints[indexB];

    // Only draw if both points are valid and visible
    if (pointA && pointB) {
      lineSegments.push([pointA.x, pointA.y, pointB.x, pointB.y]);
    }
  }

  return lineSegments;
}

/**
 * Project the whole scene to screen-space line segments.
 * Uses a view-projection matrix; each object's model matrix is applied.
 * Objects whose bounding sphere is fully outside the view frustum are skipped (object-level frustum culling).
 * Returns all wireframe segments for all visible objects in the scene.
 */
export function projectSceneToLineSegments(
  scene: Scene,
  viewProj: Mat4,
  viewport: Viewport
): Array<[number, number, number, number]> {
  const allSegments: Array<[number, number, number, number]> = [];
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
    const projectedPoints = projectMeshPoints(mesh, mvp, viewport);
    const segments = collectLineSegments(projectedPoints, mesh.vertices);
    allSegments.push(...segments);
  }

  return allSegments;
}

