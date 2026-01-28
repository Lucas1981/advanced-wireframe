import { Vec3 } from "../math/vec3";
import { Mat4 } from "../math/mat4";
import { Mesh } from "./Mesh";

/**
 * Euler rotation in radians (x = pitch, y = yaw, z = roll).
 */
export interface Euler {
  x: number;
  y: number;
  z: number;
}

/**
 * Object3D is a mesh instance in the scene with a transform:
 * position, rotation (Euler), and scale.
 */
export class Object3D {
  readonly mesh: Mesh;
  position: Vec3;
  rotation: Euler;
  scale: Vec3;

  constructor(mesh: Mesh, position?: Vec3, rotation?: Euler, scale?: Vec3) {
    this.mesh = mesh;
    this.position = position ?? Vec3.zero();
    this.rotation = rotation ?? { x: 0, y: 0, z: 0 };
    this.scale = scale ?? new Vec3(1, 1, 1);
  }

  /**
   * Build model matrix: T * R * S (scale in local space, then rotate, then translate).
   */
  getModelMatrix(): Mat4 {
    const T = Mat4.translation(this.position.x, this.position.y, this.position.z);
    const Rx = Mat4.rotationX(this.rotation.x);
    const Ry = Mat4.rotationY(this.rotation.y);
    const Rz = Mat4.rotationZ(this.rotation.z);
    const R = Rx.multiply(Ry).multiply(Rz);
    const S = Mat4.scaling(this.scale.x, this.scale.y, this.scale.z);
    return T.multiply(R).multiply(S);
  }
}
