import { Vec3 } from "../math/vec3";
import { Mat4 } from "../math/mat4";
import { Quat } from "../math/quat";

/**
 * Simple perspective camera.
 *
 * - position: world-space position of the camera
 * - orientation: rotation from camera space to world space (default: identity)
 * - fovYRad: vertical field of view in radians
 * - near / far: clipping planes
 *
 * For now we keep the camera fixed and just reuse its view/projection
 * matrices each frame, but the API supports future movement/rotation.
 */
export class Camera {
  position: Vec3;
  orientation: Quat;
  fovYRad: number;
  near: number;
  far: number;

  constructor(
    position: Vec3,
    orientation: Quat = Quat.identity(),
    fovYRad: number = Math.PI / 3, // ~60deg
    near: number = 0.1,
    far: number = 100
  ) {
    this.position = position;
    this.orientation = orientation;
    this.fovYRad = fovYRad;
    this.near = near;
    this.far = far;
  }

  /**
   * View matrix (world -> camera space).
   *
   * This is the inverse of the camera's transform:
   * R^T and translation by -position in rotated space.
   */
  getViewMatrix(): Mat4 {
    // Orientation takes camera-space into world-space.
    // For view we want world->camera, so we use the conjugate.
    const rotInv = this.orientation.conjugate().toMat4();
    const trans = Mat4.translation(-this.position.x, -this.position.y, -this.position.z);
    // Order: first translate, then rotate: R^T * T(-pos)
    return rotInv.multiply(trans);
  }

  /**
   * Projection matrix (camera space -> clip space).
   */
  getProjectionMatrix(aspect: number): Mat4 {
    return Mat4.perspective(this.fovYRad, aspect, this.near, this.far);
  }
}

