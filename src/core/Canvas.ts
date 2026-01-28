/**
 * Wrapper class for HTML5 Canvas that provides a clean API
 * for common drawing operations while still allowing access
 * to the raw canvas and context objects when needed.
 */
export class Canvas {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;

  constructor(canvasId: string, width: number, height: number) {
    const element = document.getElementById(canvasId);
    if (!element || !(element instanceof HTMLCanvasElement)) {
      throw new Error(`Canvas element with id "${canvasId}" not found`);
    }

    this.canvas = element;
    this.canvas.width = width;
    this.canvas.height = height;

    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D rendering context");
    }

    this.ctx = context;
  }

  /**
   * Get the raw HTMLCanvasElement.
   */
  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  /**
   * Get the raw CanvasRenderingContext2D.
   */
  getCtx(): CanvasRenderingContext2D {
    return this.ctx;
  }

  /**
   * Get the width of the canvas.
   */
  getWidth(): number {
    return this.canvas.width;
  }

  /**
   * Get the height of the canvas.
   */
  getHeight(): number {
    return this.canvas.height;
  }

  /**
   * Clear the entire canvas with a solid color.
   */
  clear(color: string = "#000000"): void {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw a line from point A to point B.
   */
  drawLine(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string = "#ffffff",
    lineWidth: number = 1
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.stroke();
  }

  /**
   * Draw multiple lines efficiently in a single path.
   * Takes an array of line segments: [[x1, y1, x2, y2], ...]
   */
  drawLines(
    segments: Array<[number, number, number, number]>,
    color: string = "#ffffff",
    lineWidth: number = 1
  ): void {
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = lineWidth;
    this.ctx.beginPath();

    for (const [x1, y1, x2, y2] of segments) {
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
    }

    this.ctx.stroke();
  }
}
