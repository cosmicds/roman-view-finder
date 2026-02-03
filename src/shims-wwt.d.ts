//* eslint-disable @typescript-eslint/naming-convention */

import { Color, RenderContext, WWTControl } from "@wwtelescope/engine";

declare module "@wwtelescope/engine" {

  export class Matrix3d {};

  export class Vector3d {
    static create(x: number, y: number, z: number): Vector3d;
  }

  export class SimpleLineList {
    pure2D: boolean;
    viewTransform: Matrix3d;
    set_depthBuffered(buffered: boolean): void;
    addLine(pt1: Vector3d, pt2: Vector3d): void;
    drawLines(context: RenderContext, opacity: number, color: Color): void;
  }
}
