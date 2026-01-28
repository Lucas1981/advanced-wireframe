import { Vec3 } from "../math/vec3";
import { clamp } from "../math/utils";
import { Camera } from "./Camera";
import { Quat } from "../math/quat";

/**
 * Handles keyboard input and updates the camera's position and orientation.
 *
 * Controls:
 * - Arrow keys: adjust yaw/pitch (look around)
 * - WASD: move forward/backward and strafe left/right
 */
export class InputController {
  private readonly keys = new Set<string>();

  constructor() {
    window.addEventListener("keydown", (e) => {
      this.keys.add(e.key);
    });
    window.addEventListener("keyup", (e) => {
      this.keys.delete(e.key);
    });
  }

  /**
   * Update camera based on current input and elapsed time.
   *
   * @param yaw   current yaw angle (radians)
   * @param pitch current pitch angle (radians)
   * @param camera camera to update
   * @param deltaTime seconds since last frame
   * @returns updated { yaw, pitch }
   */
  updateCamera(
    yaw: number,
    pitch: number,
    camera: Camera,
    deltaTime: number
  ): { yaw: number; pitch: number } {
    const moveSpeed = 4; // units per second
    const rotSpeed = (Math.PI / 180) * 60; // 60 deg/sec in radians

    // --- Look around with arrow keys ---
    if (this.keys.has("ArrowLeft")) {
      yaw -= rotSpeed * deltaTime;
    }
    if (this.keys.has("ArrowRight")) {
      yaw += rotSpeed * deltaTime;
    }
    if (this.keys.has("ArrowUp")) {
      pitch += rotSpeed * deltaTime;
    }
    if (this.keys.has("ArrowDown")) {
      pitch -= rotSpeed * deltaTime;
    }

    // Clamp pitch to avoid flipping
    const maxPitch = (Math.PI / 180) * 89;
    pitch = clamp(pitch, -maxPitch, maxPitch);

    // Recompute camera orientation from yaw/pitch
    camera.orientation = Quat.fromEuler(yaw, pitch, 0);

    // Compute forward/right vectors from yaw/pitch for movement
    const cosPitch = Math.cos(pitch);
    const sinPitch = Math.sin(pitch);
    const cosYaw = Math.cos(yaw);
    const sinYaw = Math.sin(yaw);

    const forward = new Vec3(
      sinYaw * cosPitch,
      sinPitch,
      -cosYaw * cosPitch
    );
    const right = new Vec3(cosYaw, 0, sinYaw);

    // WASD movement: W/S forward/back, A/D strafe left/right
    let moveDir = Vec3.zero();
    if (this.keys.has("w") || this.keys.has("W")) {
      moveDir = moveDir.add(forward);
    }
    if (this.keys.has("s") || this.keys.has("S")) {
      moveDir = moveDir.sub(forward);
    }
    if (this.keys.has("a") || this.keys.has("A")) {
      moveDir = moveDir.sub(right);
    }
    if (this.keys.has("d") || this.keys.has("D")) {
      moveDir = moveDir.add(right);
    }

    if (moveDir.lengthSq() > 0) {
      const delta = moveDir.normalize().scale(moveSpeed * deltaTime);
      camera.position = camera.position.add(delta);
    }

    return { yaw, pitch };
  }
}



