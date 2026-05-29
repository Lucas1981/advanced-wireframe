import type { Canvas } from "./Canvas";
import type { Vec3 } from "../math/vec3";

/**
 * A polygon that has survived culling, ready to be drawn.
 * Vertex indices are global — they index directly into DrawableScene.tvlist,
 * with the per-object vertex offset already applied.
 *
 * `depth` is the average camera-space z of the polygon's vertices.
 * It is only meaningful when Painter's algorithm is enabled; otherwise it is 0.
 */
export interface DrawablePolygon {
  vertexIndices: number[];
  color: string;
  depth: number;
}

/**
 * The fully projected scene: one merged vertex list covering all objects,
 * and a flat list of polygons (optionally depth-sorted) that index into it.
 */
export interface DrawableScene {
  tvlist: (Vec3 | null)[];
  polygons: DrawablePolygon[];
  debugNormalSegments: Array<[number, number, number, number]>;
}

/**
 * Draw all projected polygons onto the canvas, followed by any debug overlays.
 *
 * For each polygon, vertex indices are resolved against the shared tvlist and
 * the edges are issued as a single beginPath / stroke call.
 */
export function drawScene(
  canvas: Canvas,
  scene: DrawableScene,
  lineWidth: number = 2,
): void {
  const ctx = canvas.getCtx();
  const { tvlist, polygons, debugNormalSegments } = scene;

  for (const { vertexIndices, color } of polygons) {
    if (vertexIndices.length < 2) continue;

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();

    for (let i = 0; i < vertexIndices.length; i++) {
      const vA = tvlist[vertexIndices[i]];
      const vB = tvlist[vertexIndices[(i + 1) % vertexIndices.length]];
      if (!vA || !vB) break;
      ctx.moveTo(vA.x, vA.y);
      ctx.lineTo(vB.x, vB.y);
    }

    ctx.stroke();
  }

  if (debugNormalSegments.length > 0) {
    canvas.drawLines(debugNormalSegments, "#ff69b4", 1);
  }
}
