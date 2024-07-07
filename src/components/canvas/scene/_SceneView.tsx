"use client";

import { Group } from "three";

// import { Hologram } from "@/components/canvas/objects";
import { Jacket } from "@/components/canvas/objects";

class SceneView extends Group {
  hologram: Jacket;

  constructor() {
    super();

    this.visible = false;

    this.hologram = new Jacket();
    this.add(this.hologram);
  }

  // Public methods
  ready = () => Promise.all([this.hologram.initMesh()]);
}

export default SceneView;
