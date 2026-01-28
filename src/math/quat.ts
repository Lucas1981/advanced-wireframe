import { Vec3 } from "./vec3";
import { Mat4 } from "./mat4";

/**
 * Quaternion representing a rotation.
 *
 * We store (x, y, z, w) where w is the scalar part.
 * Quaternions here are intended to be normalized (unit length).
 */
export class Quat {
  constructor(
    public x: number,
    public y: number,
    public z: number,
    public w: number
  ) {}

  static identity(): Quat {
    return new Quat(0, 0, 0, 1);
  }

  static fromAxisAngle(axis: Vec3, angleRad: number): Quat {
    const half = angleRad * 0.5;
    const s = Math.sin(half);
    const c = Math.cos(half);
    const n = axis.normalize();
    return new Quat(n.x * s, n.y * s, n.z * s, c);
  }

  /**
   * Convenience constructor from yaw/pitch/roll (in radians).
   * Order: yaw (Y), pitch (X), roll (Z), applied in that order.
   */
  static fromEuler(yaw: number, pitch: number, roll: number): Quat {
    const cy = Math.cos(yaw * 0.5);
    const sy = Math.sin(yaw * 0.5);
    const cx = Math.cos(pitch * 0.5);
    const sx = Math.sin(pitch * 0.5);
    const cz = Math.cos(roll * 0.5);
    const sz = Math.sin(roll * 0.5);

    // Yaw-Pitch-Roll composition (Y * X * Z)
    const w = cy * cx * cz + sy * sx * sz;
    const x = cy * sx * cz + sy * cx * sz;
    const y = sy * cx * cz - cy * sx * sz;
    const z = cy * cx * sz - sy * sx * cz;

    return new Quat(x, y, z, w).normalize();
  }

  clone(): Quat {
    return new Quat(this.x, this.y, this.z, this.w);
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  normalize(): Quat {
    const len = this.length();
    if (len === 0) {
      return Quat.identity();
    }
    const inv = 1 / len;
    this.x *= inv;
    this.y *= inv;
    this.z *= inv;
    this.w *= inv;
    return this;
  }

  conjugate(): Quat {
    return new Quat(-this.x, -this.y, -this.z, this.w);
  }

  inverse(): Quat {
    const lenSq = this.lengthSq();
    if (lenSq === 0) {
      return Quat.identity();
    }
    const inv = 1 / lenSq;
    return new Quat(-this.x * inv, -this.y * inv, -this.z * inv, this.w * inv);
  }

  /**
   * Quaternion multiplication (this * other).
   * Represents composition of rotations: apply other, then this.
   */
  multiply(other: Quat): Quat {
    const ax = this.x, ay = this.y, az = this.z, aw = this.w;
    const bx = other.x, by = other.y, bz = other.z, bw = other.w;

    const x = aw * bx + ax * bw + ay * bz - az * by;
    const y = aw * by - ax * bz + ay * bw + az * bx;
    const z = aw * bz + ax * by - ay * bx + az * bw;
    const w = aw * bw - ax * bx - ay * by - az * bz;

    return new Quat(x, y, z, w);
  }

  /**
   * Convert this quaternion to a 4x4 rotation matrix (no translation).
   * Column-major layout, suitable for use in our Mat4 pipeline.
   */
  toMat4(): Mat4 {
    const x = this.x;
    const y = this.y;
    const z = this.z;
    const w = this.w;

    const xx = x * x;
    const yy = y * y;
    const zz = z * z;
    const xy = x * y;
    const xz = x * z;
    const yz = y * z;
    const wx = w * x;
    const wy = w * y;
    const wz = w * z;

    // Column-major rotation matrix derived from quaternion
    return new Mat4(
      1 - 2 * (yy + zz), 2 * (xy + wz),       2 * (xz - wy),       0,
      2 * (xy - wz),     1 - 2 * (xx + zz),   2 * (yz + wx),       0,
      2 * (xz + wy),     2 * (yz - wx),       1 - 2 * (xx + yy),   0,
      0,                 0,                   0,                   1
    );
  }
}

