// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Color, RenderContext, TriangleList, WWTControl, ss } from "@wwtelescope/engine";
import { TriangleShader2D } from "./TriangleShader2D";
import { WEBGL } from "./webgl_constants";

const originalRenderFrame = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
export function renderOneFrame() {
  originalRenderFrame();

  if (this.renderFrameCallback) {
    try {
      this.renderFrameCallback(this);
    } catch (error) {
      console.error(error);
    }
  }
}

export class TriangleList2D extends TriangleList {
  draw(renderContext: RenderContext, opacity: number, cull: boolean) {
    if (this.pure2D) {
      this._initTriangleBuffer();
      const $enum1 = ss.enumerate(this._triangleBuffers);
      while ($enum1.moveNext()) {
        const triBuffer = $enum1.current;
        TriangleShader2D.use(renderContext, triBuffer.vertexBuffer, Color.fromArgb(255, 255, 255, 255), this.depthBuffered);
        renderContext.gl.drawArrays(WEBGL.TRIANGLES, 0, triBuffer.count);
      }
    } else {
      super.draw(renderContext, opacity, cull);
    }
  }
}

export function splitString(target: string, delimiters: string[]): string[] {
  const parts = [];
  let start = 0;
  let end = 0;

  for (let i = 0; i < target.length; i++) {
    const index = delimiters.indexOf(target[i]);
    if (index > -1) {
      const part = target.substring(start, end);
      if (part.length > 0) {
        parts.push(part);
      }
      start = end + 1;
    }
    end++;
  }

  if (end > start) {
    const suffix = target.substring(start, end);
    if (suffix.length > 0) {
      parts.push(suffix);
    }
  }

  return parts;
}
