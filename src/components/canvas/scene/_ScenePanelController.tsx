"use client";

import { Point3D, Router } from "@alienkitty/alien.js/all/three";

import { Data } from "@/components/canvas/page";
import { SceneView } from "@/components/canvas/scene";

class ScenePanelController {
  static view: SceneView;

  static init(view: SceneView): void {
    this.view = view;

    this.addListeners();
  }

  static addListeners(): void {
    Point3D.events.on("click", this.onClick);
  }

  // Event handlers
  static onClick = ({ target }: { target: { index: number } }): void => {
    const data = Data.pages[target.index];

    if (data && data.path) {
      const path = Router.getPath(data.path);

      Router.setPath(`${path}/`);
      Point3D.animateOut();
    }
  };
}

export default ScenePanelController;
