"use client";

import { Group } from "three";

import { Cube, Floor, Player, Rugahand, Shark, Slant } from "@/components/canvas/objects";

class SceneView extends Group {
  floor?: Floor;
  darkPlanet?: Player;
  floatingCrystal?: Shark;
  abstractCube?: Cube;
  slant?: Slant;
  rugahand?: Rugahand;

  objects: (Player | Slant | Shark | Floor | Rugahand)[] = [];

  constructor() {
    super();

    this.visible = false;

    this.initViews();
  }

  initViews() {
    const floor = new Floor();
    this.objects.push(floor);

    this.rugahand = new Rugahand();
    this.objects.push(this.rugahand);

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
