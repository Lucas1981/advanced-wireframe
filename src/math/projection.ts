import { Vec2 } from "./vec2";
import { Vec3 } from "./vec3";
import { Vec4 } from "./vec4";
import { Mat4 } from "./mat4";

export interface Viewport {
  width: number;
  height: number;
}

export interface ProjectedPoint {
  x: number; // screen-space x in pixels
  y: number; // screen-space y in pixels
  w: number; // clip-space w (for perspective correctness)
  behind: boolean; // true if the point is behind the camera or invalid
}

/**
 * Convert NDC coordinates (x, y in [-1, 1]) to screen pixels.
 * Origin is at top-left, y increases downward.
 */
export function ndcToScreen(xNdc: number, yNdc: number, viewport: Viewport): Vec2 {
  const x = (xNdc + 1) * 0.5 * viewport.width;
  const y = (1 - (yNdc + 1) * 0.5) * viewport.height; // flip Y for screen space
  return new Vec2(x, y);
}

/**
 * Project a 3D point using an MVP matrix into 2D screen coordinates.
 *
 * - `point` is in the space that `mvp` expects (typically object/local space).
 * - `mvp` is usually projection * view * model (column-major, column vectors).
 *
 * Returns `null` if the point cannot be projected (e.g. w == 0).
 */
export function projectPoint(
  point: Vec3,
  mvp: Mat4,
  viewport: Viewport
): ProjectedPoint | null {
  const v4 = new Vec4(point.x, point.y, point.z, 1);
  const clip = mvp.transformVec4(v4);

  if (clip.w === 0) {
    return null;
  }

  const invW = 1 / clip.w;
  const xNdc = clip.x * invW;
  const yNdc = clip.y * invW;
  const zNdc = clip.z * invW;

  // Simple behind-camera / outside-depth test in NDC.
  const behind = clip.w < 0 || zNdc < -1 || zNdc > 1;

  const screen = ndcToScreen(xNdc, yNdc, viewport);

  return {
    x: screen.x,
    y: screen.y,
    w: clip.w,
    behind,
  };
}

