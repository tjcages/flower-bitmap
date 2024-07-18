"use client";

import { UI, ticker } from "@alienkitty/alien.js/all/three";
import { useEffect } from "react";

import { PanelController } from "./panel";
import { RenderManager } from "./render";
import { SceneController, SceneView } from "./scene";
import { WorldController } from "./world";

class Canvas {
  private static view: SceneView;
  private static ui: typeof UI;

  constructor() {
    Canvas.init();
  }

  static async init() {
    this.initWorld();
    this.initViews();
    this.initControllers();

    this.addListeners();
    this.onResize();

    await Promise.all([
      SceneController.ready(),
      WorldController.textureLoader.ready(),
      WorldController.environmentLoader.ready()
    ]);

    this.initPanel();
    this.animateIn();
  }

  static initWorld() {
    WorldController.init();
  }

  static initViews() {
    this.view = new SceneView();
    WorldController.scene.add(this.view);

    this.ui = new UI({ fps: false });
    this.ui.animateIn();
  }

  static initControllers() {
    const { renderer, scene, camera } = WorldController;

    SceneController.init(this.view);
    RenderManager.init(renderer, scene, camera);
  }

  static initPanel() {
    const { camera } = WorldController;
    PanelController.init(this.view, this.ui, camera);
  }

  static addListeners() {
    window.addEventListener("resize", this.onResize);
    ticker.add(this.onUpdate);
    ticker.start();
  }

  // Event handlers

  static onResize = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const dpr = window.devicePixelRatio;

    WorldController.resize(width, height, dpr);
    RenderManager.resize(width, height, dpr);
  };

  static onUpdate = (time: number, delta: number, frame: number) => {
    WorldController.update(time, delta, frame);
    RenderManager.update();
    this.ui.update();
    this.view.update();
  };

  // Public methods
  static animateIn = () => {
    SceneController.animateIn();
    this.ui.animateIn();
  };
}

const _ = () => {
  useEffect(() => {
    new Canvas();
  }, []);

  return <canvas id="canvas" className="w-full h-full text-white pointer-events-auto" />;
};

export default _;
