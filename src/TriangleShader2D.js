/* eslint-disable */

import { WEBGL } from "./webgl_constants";

export function TriangleShader2D() { }

TriangleShader2D.init = function (renderContext) {
  const gl = renderContext.gl;

  const fragShaderText = `\
      precision highp float;
      uniform vec4 lineColor;
      varying lowp vec4 vColor;

      void main(void)
      {
          gl_FragColor = lineColor * vColor;
      }
  `;

  const vertexShaderText = `\
        attribute vec3 aVertexPosition;
        attribute vec4 aVertexColor;

        varying lowp vec4 vColor;

        void main(void)
        {
            gl_Position = vec4(aVertexPosition, 1.0);
            float dAlpha = 1.0;

            vColor = vec4(aVertexColor.r, aVertexColor.g, aVertexColor.b, dAlpha * aVertexColor.a);
        }
    `;

  TriangleShader2D._frag = gl.createShader(WEBGL.FRAGMENT_SHADER);
  gl.shaderSource(TriangleShader2D._frag, fragShaderText);
  gl.compileShader(TriangleShader2D._frag);
  const statF = gl.getShaderParameter(TriangleShader2D._frag, WEBGL.COMPILE_STATUS);

  TriangleShader2D._vert = gl.createShader(WEBGL.VERTEX_SHADER);
  gl.shaderSource(TriangleShader2D._vert, vertexShaderText);
  gl.compileShader(TriangleShader2D._vert);
  const statV = gl.getShaderParameter(TriangleShader2D._vert, WEBGL.COMPILE_STATUS);

  TriangleShader2D._prog = gl.createProgram();
  gl.attachShader(TriangleShader2D._prog, TriangleShader2D._vert);
  gl.attachShader(TriangleShader2D._prog, TriangleShader2D._frag);
  gl.linkProgram(TriangleShader2D._prog);
  const errCode = gl.getProgramParameter(TriangleShader2D._prog, WEBGL.LINK_STATUS);
  gl.useProgram(TriangleShader2D._prog);

  TriangleShader2D.vertLoc = gl.getAttribLocation(TriangleShader2D._prog, "aVertexPosition");
  TriangleShader2D.colorLoc = gl.getAttribLocation(TriangleShader2D._prog, 'aVertexColor');
  TriangleShader2D.lineColorLoc = gl.getUniformLocation(TriangleShader2D._prog, 'lineColor');

  gl.enable(WEBGL.BLEND);
  gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
  TriangleShader2D.initialized = true;
};

TriangleShader2D.use = function (renderContext, vertex, lineColor, zBuffer) {
  const gl = renderContext.gl;
  if (gl != null) {
    if (!TriangleShader2D.initialized) {
      TriangleShader2D.init(renderContext);
    }
  }

  gl.useProgram(TriangleShader2D._prog);
  gl.uniform4f(TriangleShader2D.lineColorLoc, lineColor.r / 255, lineColor.g / 255, lineColor.b / 255, 1);
  if (zBuffer) {
      gl.enable(WEBGL.DEPTH_TEST);
  } else {
      gl.disable(WEBGL.DEPTH_TEST);
  }

  gl.disableVertexAttribArray(0);
  gl.disableVertexAttribArray(1);
  gl.disableVertexAttribArray(2);
  gl.disableVertexAttribArray(3);
  gl.bindBuffer(WEBGL.ARRAY_BUFFER, vertex);
  gl.bindBuffer(WEBGL.ELEMENT_ARRAY_BUFFER, null);
  gl.enableVertexAttribArray(TriangleShader2D.vertLoc);
  gl.enableVertexAttribArray(TriangleShader2D.colorLoc);
  gl.vertexAttribPointer(TriangleShader2D.vertLoc, 3, WEBGL.FLOAT, false, 36, 0);
  gl.vertexAttribPointer(TriangleShader2D.colorLoc, 4, WEBGL.FLOAT, false, 36, 12);
  gl.lineWidth(1);
  gl.enable(WEBGL.BLEND);
  gl.blendFunc(WEBGL.SRC_ALPHA, WEBGL.ONE_MINUS_SRC_ALPHA);
}
