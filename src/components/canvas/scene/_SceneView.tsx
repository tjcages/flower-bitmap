"use client";

import { Group } from "three";

import { Cube, Floor, Player, Shark, Slant } from "@/components/canvas/objects";

class SceneView extends Group {
  floor?: Floor;
  darkPlanet?: Player;
  floatingCrystal?: Shark;
  abstractCube?: Cube;
  slant?: Slant;

  objects?: (Player | Slant | Shark)[];

  constructor() {
    super();

    this.visible = false;

    this.initViews();
  }

  initViews() {
    // this.floor = new Floor();
    // this.add(this.floor);

    const player = new Player();
    this.add(player);

    const slant = new Slant({
      position: {
        y: -1.25,
        z: 0.75
      },
      rotation: {
        x: 45
      },
      color: "#666463"
    });
    this.add(slant);

    const slant2 = new Slant({
      position: {
        y: 1.3,
        z: 0.4
      },
      rotation: {
        x: -70
      },
      color: "#E2E2E2"
    });
    this.add(slant2);

    const video = new Slant({
      position: {
        y: 0,
        z: 0.225
      },
      rotation: {
        x: 90,
        y: 180
      },
      scale: {
        x: 0.8,
        z: 0.8
      },
      color: "#F4F4F4"
    });
    this.add(video);

    const knob = new Shark();
    this.add(knob);

    this.objects = [player, slant, slant2, video, knob];
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
