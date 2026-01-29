# Advanced Wireframe Engine

A TypeScript 3D wireframe engine that renders meshes as colored polygon outlines. It includes a full math and projection pipeline, object-level frustum culling, per-polygon rendering with optional back-face culling and Painter's algorithm (depth sort).

## Features

- **Math engine:** Vec2, Vec3, Vec4 (dot, cross, normalize, length), Mat4 (multiply, transformVec4, translation, scaling, rotationX/Y/Z, perspective), Quat (identity, fromEuler, conjugate, toMat4).
- **Projection:** Viewport, NDC → screen mapping (Y flip), `projectPoint(point, mvp, viewport)` with screen (x, y) and a `behind` flag. Pipeline: local → world → camera → clip → NDC → screen.
- **Scene and camera:** Camera with position (Vec3), orientation (Quat), fov/near/far; `getViewMatrix()`, `getProjectionMatrix(aspect)`. Scene holds a list of objects and the active camera.
- **Object transform:** Object3D with mesh, position, rotation (Euler), scale; `getModelMatrix()` (T×R×S).
- **Mesh:** Vertices (Vec3[] in local space), polygons (`{ color, vertexIndices }[]`). Edges are implied by polygon vertex order (draw 1–2, 2–3, …, n–1). Bounding radius is precomputed for culling.
- **IO:** Mesh JSON (vertices + polygons) loaded via `loadMesh(url)`; no separate edge list.
- **Frustum culling:** Object-level; world-space bounding sphere tested against the view frustum; off-screen objects are skipped.
- **Rendering:** Per-polygon wireframe: project vertices, then for each polygon draw lines between consecutive vertex indices (and last to first) in polygon color.
- **Back-face culling (optional):** Polygon normal in camera space from first three vertices; polygons with normal.z < 0 are skipped. Toggled by `APPLY_BACK_FACE_CULLING`.
- **Painter's algorithm (optional):** Depth per polygon (average camera-space z); sort by depth ascending (farthest first); draw in that order. Toggled by `APPLY_PAINTERS_ALGORITHM`.
- **Debug:** Optional pink lines for polygon surface normals; toggled by `DEBUG_SHOW_DIRECTION`.

The engine is wireframe-only; filled polygons are not implemented.

## Project structure

```
src/
  index.ts          # Entry point: load mesh, create scene, render loop
  index.html        # Canvas and script
  core/
    Camera.ts       # Perspective camera (view/projection matrices)
    Canvas.ts       # HTML5 Canvas wrapper (clear, drawLine, drawLines)
    Scene.ts        # List of Object3D + active camera
    Object3D.ts     # Mesh instance with position, rotation, scale
    Mesh.ts         # Vertices, polygons, bounding radius
    renderHelpers.ts # projectSceneToPolygonWireframe, frustum/backface/depth
    Input.ts        # Fly-camera input
  math/
    vec2.ts, vec3.ts, vec4.ts
    mat4.ts, quat.ts
    projection.ts   # projectPoint, NDC→screen
    frustum.ts      # isSphereInFrustum
    utils.ts
  io/
    meshLoader.ts   # loadMesh, MeshData, Polygon
  assets/
    cube.json       # Example mesh (vertices + polygons)
```

## How to use

1. **Build and run:** `npm install`, `npm run build`, then open `index.html` (or use a dev server). The demo loads `./assets/cube.json`, creates a scene with two rotating cubes, and renders with a fly camera.
2. **Load a mesh:** `const meshData = await loadMesh("./assets/cube.json"); const mesh = Mesh.fromData(meshData);`
3. **Build a scene:** `const scene = new Scene(camera); scene.add(new Object3D(mesh, position, rotation?, scale?));`
4. **Render:** Each frame: get view and projection from the camera, call `projectSceneToPolygonWireframe(scene, viewProj, viewport, options)`, then draw the returned batches (and optional debug normal segments).
5. **Flags (in `index.ts`):** Set `APPLY_PAINTERS_ALGORITHM` and/or `APPLY_BACK_FACE_CULLING` to `true` to enable depth sort and back-face culling; set `DEBUG_SHOW_DIRECTION` to `true` to draw polygon normals in pink.

## Data structures

**JSON mesh format:**

- `vertices`: array of `{ x, y, z }` (3D positions in local space). Optional `z` defaults to 0.
- `polygons`: array of `{ color: string, vertexIndices: number[] }`. Each polygon lists vertex indices; edges are implied (consecutive indices, then last back to first). Typically triangles (3 indices) or quads (4).

**In-memory:**

- **Mesh:** `vertices: Vec3[]`, `polygons: Polygon[]`, `boundingRadius: number`.
- **Polygon:** `color: string`, `vertexIndices: number[]`.
- **Object3D:** `mesh: Mesh`, `position: Vec3`, `rotation: Euler`, `scale: Vec3`; `getModelMatrix()`.
- **Scene:** `objects: Object3D[]`, `camera: Camera`.
- **Camera:** `position`, `orientation` (Quat), `fovYRad`, `near`, `far`; `getViewMatrix()`, `getProjectionMatrix(aspect)`.

Vertex winding in the JSON defines the polygon normal (right-hand rule from first three vertices); outward normals are used for correct back-face culling.

## Rendering pipeline

1. **Load:** JSON → `MeshData` (vertices, polygons) → `Mesh`.
2. **Scene:** `Mesh` + transforms → `Object3D` instances in a `Scene` with a `Camera`.
3. **Per frame:**
   - For each object: test world bounding sphere with `isSphereInFrustum`; skip if outside.
   - For each visible object: transform vertices to camera space (view×model); project vertices to screen (viewProj×model, viewport).
   - For each polygon: if back-face culling is on, compute normal in camera space and skip when normal.z < 0. Collect wireframe segments (consecutive vertex indices, last→first) and polygon depth (average camera-space z).
   - If Painter's algorithm is on: sort batches by depth ascending (farthest first).
   - Draw batches in order: for each batch, `drawLines(segments, color, lineWidth)`. If debug normals are on, draw the returned debug segments in pink.

Pipeline: **JSON → Mesh → Object3D → Scene → frustum cull → project vertices → (optional) back-face cull → per-polygon segments + depth → (optional) depth sort → draw wireframe by polygon color.**
