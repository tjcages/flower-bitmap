"use client";

import { Router } from "@alienkitty/alien.js/all/three";
import { Group } from "three";

import { CameraController } from "@/components/canvas/camera";
import { SceneView } from "@/components/canvas/scene";

const params = {
  animate: true,
  speed: 1
};

class _ {
  private static view: SceneView;
  private static animatedOneFramePast: boolean = false;

  static init(view: SceneView): void {
    this.view = view;
  }

  static addListeners(): void {
    window.addEventListener("popstate", this.onPopState);
  }

  // Event handlers
  static onPopState = (): void => {
    const view = this.getView();
    CameraController.setView(view);
  };

  // Public methods
  static getView = (): Group | undefined => {
    const { data } = Router.get(location.pathname);

    switch (data.path) {
      case "/live-playlists":
        return this.view.darkPlanet;
      case "/discoshark":
        return this.view.floatingCrystal;
      case "/packaging":
        return this.view.abstractCube;
      default:
        return undefined;
    }
  };

  static resize = (width: number, height: number): void => {
    if (this.view.resize) this.view.resize(width, height);
  };

  static update = (time: number): void => {
    if (!this.view.visible) {
      return;
    }

    if (params.animate || !this.animatedOneFramePast) {
      if (this.view.update) this.view.update(time);
      this.animatedOneFramePast = !params.animate;
    }
  };

  static animateIn = (): void => {
    this.addListeners();
    this.onPopState();
    this.view.visible = true;
  };

  static ready = (): void => {
    if (this.view.ready) this.view.ready();
  };
}

export default _;
