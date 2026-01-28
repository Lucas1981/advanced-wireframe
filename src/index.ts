// Entry point for the 3D wireframe engine
import { loadMesh } from "./io/meshLoader";
import { Mat4 } from "./math/mat4";
import { Vec3 } from "./math/vec3";
import { projectSceneToLineSegments } from "./core/renderHelpers";
import { Viewport } from "./math/projection";
import { degToRad } from "./math/utils";
import { Canvas } from "./core/Canvas";
import { Mesh } from "./core/Mesh";
import { Object3D } from "./core/Object3D";
import { Scene } from "./core/Scene";
import { Camera } from "./core/Camera";
import { Quat } from "./math/quat";
import { InputController } from "./core/Input";

// Initialize canvas
const canvas = new Canvas("canvas", 800, 600);
const viewport: Viewport = {
  width: canvas.getWidth(),
  height: canvas.getHeight(),
};

// Camera parameters
const aspect = viewport.width / viewport.height;
const fov = degToRad(60);
const near = 0.1;
const far = 100;

// Simple fly camera state (Euler angles for control, stored as quaternion in Camera).
let yaw = 0; // left/right
let pitch = -degToRad(20); // slight downward tilt to start
const cameraPosition = new Vec3(0, 4, 10);
const camera = new Camera(cameraPosition, Quat.fromEuler(yaw, pitch, 0), fov, near, far);
const input = new InputController();

// Load the cube mesh and start rendering
async function main() {
  try {
    const meshData = await loadMesh("./assets/cube.json");
    const mesh = Mesh.fromData(meshData);

    const scene = new Scene(camera);
    scene.add(new Object3D(mesh, new Vec3(-2, 0, 0)));
    scene.add(new Object3D(mesh, new Vec3(2, 0, 0)));

    let lastTime = performance.now();

    function render(currentTime: number) {
      canvas.clear();

      const now = currentTime;
      const deltaTime = (now - lastTime) / 1000;
      lastTime = now;

      // --- Camera controls via InputController ---
      const updated = input.updateCamera(yaw, pitch, camera, deltaTime);
      yaw = updated.yaw;
      pitch = updated.pitch;

      // --- Object animation ---
      const angle = now / 1000 * ((Math.PI * 2) / 4);

      // Update each object's rotation (both spin around Y)
      for (const object of scene.objects) {
        object.rotation.y = angle;
      }

      // Recompute view-projection from current camera
      const view = camera.getViewMatrix();
      const projection = camera.getProjectionMatrix(aspect);
      const viewProj = projection.multiply(view);

      const lineSegments = projectSceneToLineSegments(scene, viewProj, viewport);
      canvas.drawLines(lineSegments, "#00ff00", 2);

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  } catch (error) {
    console.error("Failed to load mesh:", error);
  }
}

main();

