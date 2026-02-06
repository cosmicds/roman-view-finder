/* eslint-disable @typescript-eslint/naming-convention */

import { Color, RenderContext } from "@wwtelescope/engine";

declare module "@wwtelescope/engine" {

  export class Coordinates {
    static parseRA(ra: string, degrees: true): number;
    static parseDec(dec: string): number;
  }

  export const ss;

  export class Matrix3d {}

  export class Vector3d {
    static create(x: number, y: number, z: number): Vector3d;
  }

  export class SimpleLineList {
    pure2D: boolean;
    viewTransform: Matrix3d;
    set_depthBuffered(buffered: boolean): void;
    addLine(pt1: Vector3d, pt2: Vector3d): void;
    drawLines(context: RenderContext, opacity: number, color: Color): void;
    clear(): void;
  }

  export class Dates {
    constructor(start: number, end: number);
  }

  export class TriangleList {
    pure2D: boolean | undefined;
    depthBuffered: boolean;
    addTriangle(v1: Vector3d, v2: Vector3d, v3: Vector3d, color: Color, date: Dates): void;
    addSubdividedTriangles(v1: Vector3d, v2: Vector3d, v3: Vector3d, color: Color, date: Dates, subdivisions: number): void;
    draw(renderContext: RenderContext, opacity: number, cull: boolean): void;
    clear(): void;
  }
}
