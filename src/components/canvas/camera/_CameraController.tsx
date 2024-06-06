"use client";

import {
  Point3D,
  Router,
  UI,
  Vector2,
  Vector3,
  lerpCameras,
  tween
} from "@alienkitty/alien.js/all/three";
import { isMobile, isSafari, isTablet } from "react-device-detect";

import { Circle, Cube, Shark } from "@/components/canvas/objects";
import { Data } from "@/components/canvas/page";
import { RenderManager } from "@/components/canvas/render";

interface WorldCamera {
  clone: () => WorldCamera;
  position: typeof Vector3;
  lookAt: (lookAt: typeof Vector3) => void;
  aspect: number;
  updateProjectionMatrix: () => void;
  fov: number;
  quaternion: typeof Vector3;
}

interface View {
  darkPlanet?: Circle;
  floatingCrystal?: Shark;
  abstractCube?: Cube;
  resize?: (width: number, height: number, dpr: number) => void;
  update?: (time: number) => void;
  camera?: CameraController;
  visible?: boolean;
  ready?: () => void;
}

class CameraController {
  static worldCamera: WorldCamera;
  static ui: typeof UI;
  static camera: WorldCamera;
  static mouse: typeof Vector2;
  static lookAt: typeof Vector3;
  static origin: typeof Vector3;
  static target: typeof Vector3;
  static targetXY: typeof Vector2;
  static progress: number;
  static lerpSpeed: number;
  static animatedIn: boolean;
  static zoomedIn: boolean;
  static enabled: boolean;
  static next?: View;
  static view?: View;
  position: typeof Vector3;
  quaternion: typeof Vector3;

  static init(worldCamera: WorldCamera, ui: typeof UI) {
    this.worldCamera = worldCamera;
    this.ui = ui;

    // Start position
    this.camera = this.worldCamera.clone();
    this.mouse = new Vector2();
    this.lookAt = new Vector3();
    this.origin = new Vector3();
    this.target = new Vector3();
    this.targetXY = new Vector2(8, 4);
    this.origin.copy(this.camera.position);
    this.camera.lookAt(this.lookAt);

    this.progress = 0;
    this.lerpSpeed = 0.07;
    this.animatedIn = false;
    this.zoomedIn = false;
    this.enabled = false;

    this.addListeners();
  }

  static addListeners() {
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
  }

  static transition() {
    Point3D.enabled = false;

    const next = this.next;
    if (!next) return;

    this.progress = 0;

    tween(
      this,
      { progress: 1 },
      1000,
      "easeInOutSine",
      () => {
        this.view = next;

        if (this.next !== this.view) {
          this.transition();
        } else {
          this.animatedIn = false;

          Point3D.enabled = true;
        }
      },
      () => {
        lerpCameras(this.worldCamera, next.camera, this.progress);
      }
    );

    if (this.zoomedIn) {
      this.ui.details.animateOut(() => {
        const { data } = Router.get(location.pathname);

        this.ui.details.title.setTitle(data.title.replace(/[\s.]+/g, " "));
        console.log(this.ui.details.content.element);
        this.ui.details.content.element.textContent = data.content;

        const next = Data.getNext(data);
        const path = Router.getPath(next.path);

        this.ui.link.setLink(next.path !== "/" ? `${path}/` : path);

        this.ui.details.animateIn();
      });

      RenderManager.zoomIn();
    } else {
      this.ui.details.animateOut();

      RenderManager.zoomOut();
    }
  }

  // Event handlers

  static onPointerDown = (e: PointerEvent) => {
    this.onPointerMove(e);
  };

  static onPointerMove = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
    if (!this.enabled) {
      return;
    }

    this.mouse.x = (clientX / document.documentElement.clientWidth) * 2 - 1;
    this.mouse.y = 0.75 - (clientY / document.documentElement.clientHeight) * 1.25;
  };

  static onPointerUp = (e: PointerEvent) => {
    this.onPointerMove(e);
  };

  // Public methods

  static setView = (view?: View) => {
    if (!(isMobile || isTablet || isSafari) && (!view || view === this.next)) {
      this.next = this;
      this.zoomedIn = false;
    } else {
      this.next = view;
      this.zoomedIn = true;
    }

    if (!this.animatedIn) {
      this.animatedIn = true;

      this.transition();
    }
  };

  static resize = (width: number, height: number) => {
    this.worldCamera.aspect = width / height;
    this.worldCamera.updateProjectionMatrix();
  };

  static update = () => {
    if (!this.enabled) {
      return;
    }

    this.target.x = this.origin.x + this.targetXY.x * this.mouse.x;
    this.target.y = this.origin.y + this.targetXY.y * this.mouse.y;
    this.target.z = this.origin.z;

    this.camera.position.lerp(this.target, this.lerpSpeed);
    this.camera.lookAt(this.lookAt);

    if (!this.animatedIn) {
      this.updateCamera();
    }
  };

  static updateCamera = () => {
    if (!this.view || !this.view.camera) return;
    this.worldCamera.position.copy(this.view.camera.position);
    this.worldCamera.quaternion.copy(this.view.camera.quaternion);
  };

  static start = () => {
    this.worldCamera.fov = 45;
    this.worldCamera.updateProjectionMatrix();
  };

  static animateIn = () => {
    this.enabled = true;
  };
}

export default CameraController;
