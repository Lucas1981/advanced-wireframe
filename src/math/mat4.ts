import { Vec4 } from "./vec4";

// We use column-major layout (OpenGL-style):
// | m0  m4  m8  m12 |
// | m1  m5  m9  m13 |
// | m2  m6  m10 m14 |
// | m3  m7  m11 m15 |
//
// Vectors are treated as column vectors and multiplied as: out = M * v.

export class Mat4 {
  readonly m: Float32Array;

  constructor(
    m0 = 1, m1 = 0, m2 = 0, m3 = 0,
    m4 = 0, m5 = 1, m6 = 0, m7 = 0,
    m8 = 0, m9 = 0, m10 = 1, m11 = 0,
    m12 = 0, m13 = 0, m14 = 0, m15 = 1
  ) {
    this.m = new Float32Array([
      m0, m1, m2, m3,
      m4, m5, m6, m7,
      m8, m9, m10, m11,
      m12, m13, m14, m15,
    ]);
  }

  static identity(): Mat4 {
    return new Mat4();
  }

  clone(): Mat4 {
    const a = this.m;
    return new Mat4(
      a[0], a[1], a[2], a[3],
      a[4], a[5], a[6], a[7],
      a[8], a[9], a[10], a[11],
      a[12], a[13], a[14], a[15]
    );
  }

  // Matrix multiplication: out = this * other
  multiply(other: Mat4): Mat4 {
    const a = this.m;
    const b = other.m;

    const m0  = a[0] * b[0]  + a[4] * b[1]  + a[8]  * b[2]  + a[12] * b[3];
    const m1  = a[1] * b[0]  + a[5] * b[1]  + a[9]  * b[2]  + a[13] * b[3];
    const m2  = a[2] * b[0]  + a[6] * b[1]  + a[10] * b[2]  + a[14] * b[3];
    const m3  = a[3] * b[0]  + a[7] * b[1]  + a[11] * b[2]  + a[15] * b[3];

    const m4  = a[0] * b[4]  + a[4] * b[5]  + a[8]  * b[6]  + a[12] * b[7];
    const m5  = a[1] * b[4]  + a[5] * b[5]  + a[9]  * b[6]  + a[13] * b[7];
    const m6  = a[2] * b[4]  + a[6] * b[5]  + a[10] * b[6]  + a[14] * b[7];
    const m7  = a[3] * b[4]  + a[7] * b[5]  + a[11] * b[6]  + a[15] * b[7];

    const m8  = a[0] * b[8]  + a[4] * b[9]  + a[8]  * b[10] + a[12] * b[11];
    const m9  = a[1] * b[8]  + a[5] * b[9]  + a[9]  * b[10] + a[13] * b[11];
    const m10 = a[2] * b[8]  + a[6] * b[9]  + a[10] * b[10] + a[14] * b[11];
    const m11 = a[3] * b[8]  + a[7] * b[9]  + a[11] * b[10] + a[15] * b[11];

    const m12 = a[0] * b[12] + a[4] * b[13] + a[8]  * b[14] + a[12] * b[15];
    const m13 = a[1] * b[12] + a[5] * b[13] + a[9]  * b[14] + a[13] * b[15];
    const m14 = a[2] * b[12] + a[6] * b[13] + a[10] * b[14] + a[14] * b[15];
    const m15 = a[3] * b[12] + a[7] * b[13] + a[11] * b[14] + a[15] * b[15];

    return new Mat4(
      m0, m1, m2, m3,
      m4, m5, m6, m7,
      m8, m9, m10, m11,
      m12, m13, m14, m15
    );
  }

  // Transform a Vec4 (column vector): out = this * v
  transformVec4(v: Vec4): Vec4 {
    const a = this.m;
    const x = v.x, y = v.y, z = v.z, w = v.w;
    return new Vec4(
      a[0] * x + a[4] * y + a[8]  * z + a[12] * w,
      a[1] * x + a[5] * y + a[9]  * z + a[13] * w,
      a[2] * x + a[6] * y + a[10] * z + a[14] * w,
      a[3] * x + a[7] * y + a[11] * z + a[15] * w
    );
  }

  static translation(tx: number, ty: number, tz: number): Mat4 {
    return new Mat4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      tx, ty, tz, 1
    );
  }

  static scaling(sx: number, sy: number, sz: number): Mat4 {
    return new Mat4(
      sx, 0,  0,  0,
      0,  sy, 0,  0,
      0,  0,  sz, 0,
      0,  0,  0,  1
    );
  }

  static rotationX(rad: number): Mat4 {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Mat4(
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1
    );
  }

  static rotationY(rad: number): Mat4 {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Mat4(
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1
    );
  }

  static rotationZ(rad: number): Mat4 {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    return new Mat4(
      c, s, 0, 0,
      -s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  // Perspective projection matrix (right-handed, looking down -Z)
  static perspective(fovYRad: number, aspect: number, near: number, far: number): Mat4 {
    const f = 1.0 / Math.tan(fovYRad / 2);
    const rangeInv = 1.0 / (near - far);

    return new Mat4(
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (far + near) * rangeInv, -1,
      0, 0, (2 * far * near) * rangeInv, 0
    );
  }
}

