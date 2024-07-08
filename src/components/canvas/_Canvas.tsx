"use client";

import { ImageBitmapLoaderThread, Stage, Thread, UI, ticker } from "@alienkitty/alien.js/all/three";
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
    this.initThread();
    this.initStage();
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

  static initThread() {
    ImageBitmapLoaderThread.init();

    Thread.shared();
  }

  static initStage() {
    Stage.init();
    Stage.css({ opacity: 0 });
  }

  static initWorld() {
    WorldController.init();
    Stage.add(WorldController.element);
  }

  static initViews() {
    this.view = new SceneView();
    WorldController.scene.add(this.view);

    this.ui = new UI({ fps: true });
    this.ui.animateIn();

    Stage.add(this.ui);
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
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
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

    Stage.tween({ opacity: 1 }, 1000, "linear", () => {
      Stage.css({ opacity: "" });
    });
  };
}

const _ = () => {
  useEffect(() => {
    console.log("Render canvas");
    new Canvas();
  }, []);

  return (
    <canvas
      id="canvas"
      className="fixed top-0 right-0 left-0 bottom-0 w-full h-full text-white pointer-events-auto"
    />
  );
};

export default _;
