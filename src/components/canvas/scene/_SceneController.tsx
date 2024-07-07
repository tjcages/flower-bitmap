"use client";

import { SceneView } from "@/components/canvas/scene";

class _ {
  static view: SceneView;

  static init(view: SceneView) {
    this.view = view;
  }

  // Public methods

  static animateIn = () => {
    this.view.visible = true;
  };

  static ready = () => this.view.ready();

  static update = (): void => {
    if (!this.view.visible) {
      return;
    }
    if (this.view.update) this.view.update();
  };
}

export default _;
