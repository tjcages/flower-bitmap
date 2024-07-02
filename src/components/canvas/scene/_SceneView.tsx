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
      position: { x: 0, y: 0, z: 1 }
    });
    this.objects.push(player);

    const player2 = new Player({
      position: { x: 1, y: 1.5, z: -6 }
    });
    this.objects.push(player2);

    const player3 = new Player({
      position: { x: -2, y: 3, z: -12 }
    });
    this.objects.push(player3);

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
