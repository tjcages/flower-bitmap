"use client";

import { Group } from "three";

import { Cube, Floor, Player, Shark, Slant } from "@/components/canvas/objects";

class SceneView extends Group {
  floor?: Floor;
  darkPlanet?: Player;
  floatingCrystal?: Shark;
  abstractCube?: Cube;
  slant?: Slant;

  objects: (Player | Slant | Shark | Floor)[] = [];

  constructor() {
    super();

    this.visible = false;

    this.initViews();
  }

  initViews() {
    const floor = new Floor();
    this.objects.push(floor);

    const player = new Player({
      position: { x: 0, y: 0.75, z: 2 }
    });
    this.objects.push(player);

    this.objects.reverse().map(obj => this.add(obj));
  }

  // Public methods

  resize = (width: number, height: number): void => {
    this.objects?.forEach(object => object.resize(width, height));
  };

  update = (): void => {
    this.objects?.forEach(object => object.update());
  };

  ready = (): Promise<void[]> =>
    this.objects ? Promise.all(this.objects.map(object => object.initMesh())) : Promise.resolve([]);
}

export default SceneView;
