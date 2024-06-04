"use client";

import {
  DisplayOptions,
  MathUtils,
  PanelItem,
  Point3D,
  Stage,
  UI,
  getKeyByValue
} from "@alienkitty/alien.js/all/three";

import { RenderManager } from "@/components/canvas/render";
import { SceneView } from "@/components/canvas/scene";
import { WorldController } from "@/components/canvas/world";

interface Params {
  animate: boolean;
  speed: number;
}

const params: Params = {
  animate: true,
  speed: 1
};

class PanelController {
  static view: SceneView;
  static ui: typeof UI;

  static init(view: SceneView, ui: typeof UI) {
    this.view = view;
    this.ui = ui;

    this.initControllers();
    this.initPanel();
  }

  static initControllers() {
    const { scene, camera } = WorldController;

    Point3D.init(scene, camera, {
      root: Stage,
      container: this.ui,
      debug: false
    });
  }

  static initPanel() {
    const {
      motionBlur,
      hBlurMaterial,
      vBlurMaterial,
      luminosityMaterial,
      bloomCompositeMaterial,
      compositeMaterial
    } = RenderManager;

    const animateOptions = {
      Off: false,
      Animate: true
    };

    const debugOptions = {
      Off: false,
      Debug: true
    };

    const items: (typeof PanelItem)[] = [
      {
        name: "FPS"
      },
      {
        type: "divider"
      },
      {
        type: "list",
        list: DisplayOptions,
        value: getKeyByValue(DisplayOptions, RenderManager.display),
        callback: (value: string) => {
          RenderManager.display = DisplayOptions[value];
        }
      },
      {
        type: "divider"
      },
      {
        type: "slider",
        name: "Speed",
        min: 0,
        max: 50,
        step: 0.1,
        value: params.speed,
        callback: (value: number) => {
          params.speed = value;
        }
      },
      {
        type: "list",
        list: animateOptions,
        value: getKeyByValue(animateOptions, params.animate),
        callback: (value: keyof typeof animateOptions) => {
          params.animate = animateOptions[value];
          motionBlur.saveState = params.animate;
        }
      },
      {
        type: "divider"
      },
      {
        type: "slider",
        name: "Interp",
        min: 0,
        max: 1,
        step: 0.01,
        value: motionBlur.interpolateGeometry,
        callback: (value: number) => {
          motionBlur.interpolateGeometry = value;
        }
      },
      {
        type: "slider",
        name: "Smear",
        min: 0,
        max: 4,
        step: 0.02,
        value: motionBlur.smearIntensity,
        callback: (value: number) => {
          motionBlur.smearIntensity = value;
        }
      },
      {
        type: "divider"
      },
      {
        type: "slider",
        name: "Focus",
        min: 0,
        max: 1,
        step: 0.01,
        value: RenderManager.blurFocus,
        callback: (value: number) => {
          hBlurMaterial.uniforms.uFocus.value = value;
          vBlurMaterial.uniforms.uFocus.value = value;
          compositeMaterial.uniforms.uFocus.value = value;
        }
      },
      {
        type: "slider",
        name: "Rotate",
        min: 0,
        max: 360,
        step: 0.3,
        value: MathUtils.radToDeg(RenderManager.blurRotation),
        callback: (value: number) => {
          value = MathUtils.degToRad(value);
          hBlurMaterial.uniforms.uRotation.value = value;
          vBlurMaterial.uniforms.uRotation.value = value;
          compositeMaterial.uniforms.uRotation.value = value;
        }
      },
      {
        type: "slider",
        name: "Blur",
        min: 0,
        max: 2,
        step: 0.01,
        value: RenderManager.blurFactor,
        callback: (value: number) => {
          RenderManager.blurFactor = value;
        }
      },
      {
        type: "slider",
        name: "Chroma",
        min: 0,
        max: 10,
        step: 0.1,
        value: compositeMaterial.uniforms.uDistortion.value,
        callback: (value: number) => {
          compositeMaterial.uniforms.uDistortion.value = value;
        }
      },
      {
        type: "list",
        list: debugOptions,
        value: getKeyByValue(debugOptions, vBlurMaterial.uniforms.uDebug.value),
        callback: (value: string) => {
          vBlurMaterial.uniforms.uDebug.value = debugOptions[value as keyof typeof debugOptions];
        }
      },
      {
        type: "divider"
      },
      {
        type: "slider",
        name: "Thresh",
        min: 0,
        max: 1,
        step: 0.01,
        value: luminosityMaterial.uniforms.uThreshold.value,
        callback: (value: number) => {
          luminosityMaterial.uniforms.uThreshold.value = value;
        }
      },
      {
        type: "slider",
        name: "Smooth",
        min: 0,
        max: 1,
        step: 0.01,
        value: luminosityMaterial.uniforms.uSmoothing.value,
        callback: (value: number) => {
          luminosityMaterial.uniforms.uSmoothing.value = value;
        }
      },
      {
        type: "slider",
        name: "Strength",
        min: 0,
        max: 2,
        step: 0.01,
        value: RenderManager.bloomStrength,
        callback: (value: number) => {
          RenderManager.bloomStrength = value;
          bloomCompositeMaterial.uniforms.uBloomFactors.value = RenderManager.bloomFactors();
        }
      },
      {
        type: "slider",
        name: "Radius",
        min: 0,
        max: 1,
        step: 0.01,
        value: RenderManager.bloomRadius,
        callback: (value: number) => {
          RenderManager.bloomRadius = value;
          bloomCompositeMaterial.uniforms.uBloomFactors.value = RenderManager.bloomFactors();
        }
      }
    ];

    items.forEach(data => {
      const item = new PanelItem(data);
      this.ui.addPanel(item);
    });
  }

  // Public methods

  static update = (time: number) => {
    if (!this.ui) return;

    Point3D.update(time);
  };
}

export default PanelController;
