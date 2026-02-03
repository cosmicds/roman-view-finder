// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { WWTControl } from "@wwtelescope/engine";

const originalRenderFrame = WWTControl.singleton.renderOneFrame.bind(WWTControl.singleton);
export function renderOneFrame() {
  originalRenderFrame();

  if (this.renderFrameCallback) {
    this.renderFrameCallback(this);
  }
}
