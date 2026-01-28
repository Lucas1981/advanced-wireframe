export class Vec4 {
  constructor(public x: number, public y: number, public z: number, public w: number) {}

  static fromVec3(x: number, y: number, z: number, w = 1): Vec4 {
    return new Vec4(x, y, z, w);
  }

  static fromArray(a: [number, number, number, number]): Vec4 {
    return new Vec4(a[0], a[1], a[2], a[3]);
  }

  clone(): Vec4 {
    return new Vec4(this.x, this.y, this.z, this.w);
  }

  toArray(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }
}

