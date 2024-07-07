"use client";

import { PanelItem, UI } from "@alienkitty/alien.js/all/three";

import { RenderManager } from "@/components/canvas/render";
import { SceneView } from "@/components/canvas/scene";

class PanelController {
  static view: SceneView;
  static ui: typeof UI;

  static init(view: SceneView, ui: typeof UI) {
    this.view = view;
    this.ui = ui;

    this.initPanel();
  }

  static initPanel() {
    const {
      hBlurMaterial,
      vBlurMaterial,
      videoGlitchMaterial,
      luminosityMaterial,
      bloomCompositeMaterial,
      caMaterial
    } = RenderManager;

    const { hologram } = this.view;

    const items = [
      {
        name: "FPS"
      },
      {
        type: "divider"
      },
      {
        type: "slider",
        name: "Fresnel",
        min: 0,
        max: 3,
        step: 0.01,
        value: hologram.uniforms.fresnelPower.value,
        callback: (value: number) => {
          hologram.uniforms.fresnelPower.value = value;
        }
      },
      {
        type: "slider",
        name: "Glow",
        min: 0,
        max: 10,
        step: 0.1,
        value: hBlurMaterial.uniforms.uBluriness.value,
        callback: (value: number) => {
          hBlurMaterial.uniforms.uBluriness.value = value;
          vBlurMaterial.uniforms.uBluriness.value = value;
        }
      },
      {
        type: "divider"
      },
      {
        type: "slider",
        name: "Distort",
        min: 0,
        max: 2,
        step: 0.01,
        value: videoGlitchMaterial.uniforms.uDistortion.value,
        callback: (value: number) => {
          videoGlitchMaterial.uniforms.uDistortion.value = value;
        }
      },
      {
        type: "slider",
        name: "Distort2",
        min: 0,
        max: 1,
        step: 0.01,
        value: videoGlitchMaterial.uniforms.uDistortion2.value,
        callback: (value: number) => {
          videoGlitchMaterial.uniforms.uDistortion2.value = value;
        }
      },
      {
        type: "slider",
        name: "Speed",
        min: 0,
        max: 2,
        step: 0.01,
        value: videoGlitchMaterial.uniforms.uSpeed.value,
        callback: (value: number) => {
          videoGlitchMaterial.uniforms.uSpeed.value = value;
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
      },
      {
        type: "divider"
      },
      {
        type: "slider",
        name: "Red",
        min: -4,
        max: 4,
        step: 0.05,
        value: caMaterial.uniforms.uRedOffset.value,
        callback: (value: number) => {
          caMaterial.uniforms.uRedOffset.value = value;
        }
      },
      {
        type: "slider",
        name: "Green",
        min: -4,
        max: 4,
        step: 0.05,
        value: caMaterial.uniforms.uGreenOffset.value,
        callback: (value: number) => {
          caMaterial.uniforms.uGreenOffset.value = value;
        }
      },
      {
        type: "slider",
        name: "Blue",
        min: -4,
        max: 4,
        step: 0.05,
        value: caMaterial.uniforms.uBlueOffset.value,
        callback: (value: number) => {
          caMaterial.uniforms.uBlueOffset.value = value;
        }
      },
      {
        type: "slider",
        name: "Int",
        min: 0,
        max: 3,
        step: 0.01,
        value: caMaterial.uniforms.uIntensity.value,
        callback: (value: number) => {
          caMaterial.uniforms.uIntensity.value = value;
        }
      }
    ];

    items.forEach(data => {
      this.ui.addPanel(new PanelItem(data));
    });
  }
}

export default PanelController;
