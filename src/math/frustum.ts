import { Vec3 } from "./vec3";
import { Vec4 } from "./vec4";
import { Mat4 } from "./mat4";

/**
 * Tests whether a world-space bounding sphere is visible (intersects or is
 * inside) the view frustum. Used for object-level frustum culling.
 *
 * - Transforms the sphere center to camera space using the view matrix.
 * - Tests against near and far planes.
 * - Tests against the four FOV planes (left, right, top, bottom) using
 *   the camera's vertical FOV and aspect ratio.
 *
 * @param worldCenter - Center of the sphere in world space
 * @param worldRadius - Radius of the sphere in world space
 * @param viewMatrix - World-to-camera matrix (e.g. camera.getViewMatrix())
 * @param fovYRad - Vertical field of view in radians
 * @param aspect - Viewport aspect ratio (width / height)
 * @param near - Near clipping plane distance
 * @param far - Far clipping plane distance
 * @returns true if the sphere is visible (should be drawn), false if fully outside (cull)
 */
export function isSphereInFrustum(
  worldCenter: Vec3,
  worldRadius: number,
  viewMatrix: Mat4,
  fovYRad: number,
  aspect: number,
  near: number,
  far: number
): boolean {
  const v = viewMatrix.transformVec4(new Vec4(worldCenter.x, worldCenter.y, worldCenter.z, 1));
  const cx = v.x;
  const cy = v.y;
  const cz = v.z;

  // Camera looks down -Z; visible z is in [-far, -near]

  // Near plane: z = -near. Sphere entirely in front (invalid) if cz - radius > -near
  if (cz - worldRadius > -near) return false;

  // Far plane: z = -far. Sphere entirely behind far if cz + radius < -far
  if (cz + worldRadius < -far) return false;

  // Side planes through origin. At z = -1: x in [-a, a], y in [-b, b]
  // with a = aspect * tan(fovY/2), b = tan(fovY/2).
  // Outward normals (unnormalized): right (1, 0, a), left (-1, 0, a), top (0, 1, b), bottom (0, -1, b).
  const tanHalfFovY = Math.tan(fovYRad / 2);
  const a = aspect * tanHalfFovY;
  const b = tanHalfFovY;

  // Signed distance of sphere's closest point to plane: center·n - radius.
  // Cull when center·n > radius (sphere entirely outside).

  if (cx + a * cz > worldRadius * Math.hypot(1, a)) return false;   // right
  if (-cx + a * cz > worldRadius * Math.hypot(1, a)) return false;  // left
  if (cy + b * cz > worldRadius * Math.hypot(1, b)) return false;   // top
  if (-cy + b * cz > worldRadius * Math.hypot(1, b)) return false;  // bottom

  return true;
}
