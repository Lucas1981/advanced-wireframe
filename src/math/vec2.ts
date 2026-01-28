import { EPSILON } from "./utils";

export class Vec2 {
  constructor(public x: number, public y: number) {}

  static zero(): Vec2 {
    return new Vec2(0, 0);
  }

  static fromArray(a: [number, number]): Vec2 {
    return new Vec2(a[0], a[1]);
  }

  static fromScalar(s: number): Vec2 {
    return new Vec2(s, s);
  }

  clone(): Vec2 {
    return new Vec2(this.x, this.y);
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  add(v: Vec2): Vec2 {
    return new Vec2(this.x + v.x, this.y + v.y);
  }

  sub(v: Vec2): Vec2 {
    return new Vec2(this.x - v.x, this.y - v.y);
  }

  scale(s: number): Vec2 {
    return new Vec2(this.x * s, this.y * s);
  }

  negate(): Vec2 {
    return new Vec2(-this.x, -this.y);
  }

  dot(v: Vec2): number {
    return this.x * v.x + this.y * v.y;
  }

  lengthSq(): number {
    return this.dot(this);
  }

  length(): number {
    return Math.hypot(this.x, this.y);
  }

  normalize(): Vec2 {
    const len = this.length();
    if (len === 0) return new Vec2(0, 0);
    return this.scale(1 / len);
  }

  equals(v: Vec2, epsilon = EPSILON): boolean {
    return (
      Math.abs(this.x - v.x) <= epsilon &&
      Math.abs(this.y - v.y) <= epsilon
    );
  }

  static lerp(a: Vec2, b: Vec2, t: number): Vec2 {
    return new Vec2(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t
    );
  }

  static distance(a: Vec2, b: Vec2): number {
    return a.sub(b).length();
  }

  static distanceSq(a: Vec2, b: Vec2): number {
    return a.sub(b).lengthSq();
  }
}

