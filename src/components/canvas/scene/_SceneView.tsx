"use client";

import { Group } from "three";

import { Cube, Floor, Player, Shark } from "@/components/canvas/objects";

class SceneView extends Group {
  floor?: Floor;
  darkPlanet?: Player;
  floatingCrystal?: Shark;
  abstractCube?: Cube;

  constructor() {
    super();

    this.visible = false;

    this.initViews();
  }

  initViews() {
    this.floor = new Floor();
    this.add(this.floor);

    this.darkPlanet = new Player();
    this.add(this.darkPlanet);

    this.floatingCrystal = new Shark();
    this.add(this.floatingCrystal);

    this.abstractCube = new Cube();
    this.add(this.abstractCube);
  }

  // Public methods

  resize = (width: number, height: number): void => {
    if (this.floor) this.floor.resize(width, height);
    if (this.darkPlanet) this.darkPlanet.resize(width, height);
    if (this.floatingCrystal) this.floatingCrystal.resize(width, height);
    if (this.abstractCube) this.abstractCube.resize(width, height);
  };

  update = (time: number): void => {
    if (this.darkPlanet) this.darkPlanet.update();
    if (this.floatingCrystal) this.floatingCrystal.update(time);
    if (this.abstractCube) this.abstractCube.update();
  };

  ready = (): Promise<void[]> =>
    Promise.all([
      this.floor?.initMesh(),
      this.darkPlanet?.initMesh(),
      this.floatingCrystal?.initMesh(),
      this.abstractCube?.initMesh()
    ]);
}

export default SceneView;
