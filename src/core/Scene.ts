import { Object3D } from "./Object3D";
import { Camera } from "./Camera";

/**
 * Scene (world) holds all objects to be rendered plus the active camera.
 */
export class Scene {
  private _objects: Object3D[] = [];
  camera: Camera;

  constructor(camera: Camera) {
    this.camera = camera;
  }

  get objects(): readonly Object3D[] {
    return this._objects;
  }

  add(object: Object3D): void {
    this._objects.push(object);
  }

  remove(object: Object3D): boolean {
    const i = this._objects.indexOf(object);
    if (i === -1) return false;
    this._objects.splice(i, 1);
    return true;
  }

  clear(): void {
    this._objects.length = 0;
  }
}

