"use client";

import { Point3D, Router } from "@alienkitty/alien.js/all/three";

import { Data } from "@/components/canvas/page";
import { SceneView } from "@/components/canvas/scene";

class ScenePanelController {
  static view: SceneView;

  static init(view: SceneView): void {
    this.view = view;

    this.initPanel();

    this.addListeners();
  }

  static initPanel(): void {
    const { darkPlanet, abstractCube } = this.view;

    const objects = [darkPlanet, darkPlanet, abstractCube]; // temporary to hide discoshark hover state
    objects.forEach((object, index) => {
      if (object) {
        object.point = new Point3D(object.mesh, {
          type: "",
          noTracker: true,
          index: index
        });
        object.add(object.point);
      }
    });

    // Shrink tracker meshes a little bit
    // if (abstractCube) abstractCube.point.mesh.scale.multiplyScalar(0.9);
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
