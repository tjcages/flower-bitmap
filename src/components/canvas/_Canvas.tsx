"use client";

import {
  AssetLoader,
  Router,
  Stage,
  UI,
  delayedCall,
  ticker
} from "@alienkitty/alien.js/all/three";
import { useEffect } from "react";
import { isMobile, isSafari, isTablet } from "react-device-detect";

import { CameraController } from "./camera";
import { Data, Page } from "./page";
import { PanelController } from "./panel";
import { RenderManager } from "./render";
import { SceneController, ScenePanelController, SceneView } from "./scene";
import { WorldController } from "./world";

const breakpoint = 1000;

class Canvas {
  private static assetLoader: typeof AssetLoader;
  private static view: SceneView;
  private static ui: typeof UI;

  constructor() {
    Canvas.init();
  }

  static async init() {
    this.initLoader();
    this.initStage();
    this.initWorld();

    await this.loadData();

    this.initRouter();
    this.initViews();
    this.initControllers();

    this.addListeners();
    this.onResize();

    await Promise.all([
      SceneController.ready(),
      WorldController.textureLoader.ready(),
      WorldController.environmentLoader.ready()
    ]);

    delayedCall(1000, () => {
      this.initPanel();
    });

    CameraController.start();
    RenderManager.start();

    this.animateIn();
  }

  static initLoader() {
    this.assetLoader = new AssetLoader();
    this.assetLoader.setPath("/");
  }

  static initStage() {
    Stage.init();
    Stage.css({ opacity: 0 });
  }

  static initWorld() {
    WorldController.init();
    Stage.add(WorldController.element);
  }

  static async loadData() {
    const data = await this.assetLoader.loadData("./data/data.json");

    Data.init(data);
  }

  static initRouter() {
    Data.pages.forEach(page => {
      Router.add(page.path, Page, page);
    });

    // Landing and 404 page
    let home;

    if (!(isMobile || isTablet || isSafari)) {
      home = {
        path: "/",
        title: "Totem"
      };

      Data.pages.push(home);
      Data.pageIndex = Data.pages.length - 1;
    } else {
      home = Data.pages[0]; // Dark Planet
    }

    Router.add("/", Page, home);
    Router.add("404", Page, home);

    Router.init({ path: "/" });
  }

  static initViews() {
    this.view = new SceneView();
    WorldController.scene.add(this.view);

    this.ui = new UI({
      fps: true,
      breakpoint,
      details: {
        title: "",
        content: /* html */ `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
        links: [
          {
            title: "Next"
          }
        ]
      }
    });
    this.ui.link = this.ui.details.links[0];
    Stage.add(this.ui);
  }

  static initControllers() {
    const { renderer, scene, camera } = WorldController;

    CameraController.init(camera, this.ui);
    SceneController.init(this.view);
    RenderManager.init(renderer, scene, camera);
  }

  static initPanel() {
    PanelController.init(this.view, this.ui);
    ScenePanelController.init(this.view);
  }

  static addListeners() {
    window.addEventListener("resize", this.onResize);
    ticker.add(this.onUpdate);
    this.ui.link.events.on("click", this.onClick);
  }

  // Event handlers

  static onResize = () => {
    const width = document.documentElement.clientWidth;
    const height = document.documentElement.clientHeight;
    const dpr = window.devicePixelRatio;

    WorldController.resize(width, height, dpr);
    CameraController.resize(width, height);
    SceneController.resize(width, height);
    RenderManager.resize(width, height, dpr);
  };

  static onUpdate = (time: number, delta: number, frame: number) => {
    WorldController.update(time, delta, frame);
    CameraController.update();
    SceneController.update(time);
    RenderManager.update();
    PanelController.update(time);
    this.ui.update();
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static onClick = (e: MouseEvent, { target }: { target: { link: string } }) => {
    e.preventDefault();

    Router.setPath(target.link);
  };

  // Public methods
  static animateIn = () => {
    CameraController.animateIn();
    SceneController.animateIn();
    this.ui.animateIn();

    Stage.tween({ opacity: 1 }, 1000, "linear", () => {
      Stage.css({ opacity: "" });
    });
  };
}

const _ = () => {
  useEffect(() => {
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
