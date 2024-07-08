"use client";

import {
  BloomCompositeMaterial,
  DepthMaterial,
  DisplayOptions,
  LuminosityMaterial,
  MotionBlur,
  MotionBlurCompositeMaterial,
  NormalMaterial,
  Renderer,
  SceneCompositeMaterial,
  UnrealBloomBlurMaterial,
  clearTween,
  delayedCall,
  tween
} from "@alienkitty/alien.js/all/three";
import { isMobile, isSafari, isTablet } from "react-device-detect";
import {
  AdditiveBlending,
  Camera,
  Color,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  NoBlending,
  OrthographicCamera,
  Scene,
  Vector2,
  WebGLRenderTarget
} from "three";

import { Blur, Composite } from "@/components/canvas/materials";
import { WorldController } from "@/components/canvas/world";

const layers = {
  default: 0,
  velocity: 1
};

const BlurDirectionX = new Vector2(1, 0);
const BlurDirectionY = new Vector2(0, 1);

class RenderManager {
  static renderer: typeof Renderer;
  static scene: Scene;
  static camera: Camera;
  static blurFocus: number;
  static blurRotation: number;
  static blurFactor: number;
  static luminosityThreshold: number;
  static luminositySmoothing: number;
  static bloomStrength: number;
  static bloomRadius: number;
  static display: typeof DisplayOptions;
  static enabled: boolean;
  static clearColor: Color;
  static currentClearColor: Color;
  static screenCamera: OrthographicCamera;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static screen: any;
  static renderTargetA: WebGLRenderTarget;
  static renderTargetB: WebGLRenderTarget;
  static renderTargetC: WebGLRenderTarget;
  static renderTargetsHorizontal: WebGLRenderTarget[];
  static renderTargetsVertical: WebGLRenderTarget[];
  static nMips: number;
  static renderTargetBright: WebGLRenderTarget;
  static motionBlur: typeof MotionBlur;
  static motionBlurCompositeMaterial: typeof MotionBlurCompositeMaterial;
  static hBlurMaterial: Blur;
  static vBlurMaterial: Blur;
  static luminosityMaterial: typeof LuminosityMaterial;
  static blurMaterials: (typeof UnrealBloomBlurMaterial)[];
  static bloomCompositeMaterial: typeof BloomCompositeMaterial;
  static sceneCompositeMaterial: typeof SceneCompositeMaterial;
  static compositeMaterial: Composite;
  static blackoutMaterial: MeshBasicMaterial;
  static matcap1Material: MeshMatcapMaterial;
  static matcap2Material: MeshMatcapMaterial;
  static normalMaterial: typeof NormalMaterial;
  static depthMaterial: typeof DepthMaterial;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static currentOverrideMaterial: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static currentBackground: any;
  static currentClearAlpha: number;
  static timeout: number;

  static init(renderer: typeof Renderer, scene: Scene, camera: Camera): void {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // Blur
    this.blurFocus = isMobile || isTablet || isSafari ? 0.5 : 0.25;
    this.blurRotation = isMobile || isTablet || isSafari ? 0 : MathUtils.degToRad(75);
    this.blurFactor = 1;

    // Bloom
    this.luminosityThreshold = 1;
    this.luminositySmoothing = 1;
    this.bloomStrength = 0.97;
    this.bloomRadius = 0.3;

    // Debug
    this.display = DisplayOptions.Default;

    this.enabled = true;

    this.initRenderer();
  }

  static initRenderer(): void {
    const { screenTriangle, textureLoader, time, getTexture } = WorldController;

    // Manually clear
    this.renderer.autoClear = false;

    // Clear colors
    this.clearColor = new Color(0, 0, 0);
    this.currentClearColor = new Color();

    // Fullscreen triangle
    this.screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.screen = new Mesh(screenTriangle);
    this.screen.frustumCulled = false;

    // Render targets
    this.renderTargetA = new WebGLRenderTarget(1, 1, {
      depthBuffer: false
    });

    this.renderTargetB = this.renderTargetA.clone();
    this.renderTargetC = this.renderTargetA.clone();

    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;

    this.renderTargetBright = this.renderTargetA.clone();

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.renderTargetsHorizontal.push(this.renderTargetA.clone());
      this.renderTargetsVertical.push(this.renderTargetA.clone());
    }

    this.renderTargetA.depthBuffer = true;

    // Motion blur
    this.motionBlur = new MotionBlur(this.renderer, this.scene, this.camera, layers.velocity, {
      interpolateGeometry: 0
    });

    this.motionBlurCompositeMaterial = new MotionBlurCompositeMaterial(textureLoader);
    this.motionBlurCompositeMaterial.uniforms.tVelocity.value =
      this.motionBlur.renderTarget.texture;

    // Gaussian blur materials
    this.hBlurMaterial = new Blur(BlurDirectionX);
    this.hBlurMaterial.uniforms.uFocus.value = this.blurFocus;
    this.hBlurMaterial.uniforms.uRotation.value = this.blurRotation;
    this.hBlurMaterial.uniforms.uBluriness.value = this.blurFactor;
    this.hBlurMaterial.uniforms.uTime = time;

    this.vBlurMaterial = new Blur(BlurDirectionY);
    this.vBlurMaterial.uniforms.uFocus.value = this.blurFocus;
    this.vBlurMaterial.uniforms.uRotation.value = this.blurRotation;
    this.vBlurMaterial.uniforms.uBluriness.value = this.blurFactor;
    this.vBlurMaterial.uniforms.uTime = time;

    // Luminosity high pass material
    this.luminosityMaterial = new LuminosityMaterial();
    this.luminosityMaterial.uniforms.uThreshold.value = this.luminosityThreshold;
    this.luminosityMaterial.uniforms.uSmoothing.value = this.luminositySmoothing;

    // Separable Gaussian blur materials
    this.blurMaterials = [];

    const kernelSizeArray = [3, 5, 7, 9, 11];

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.blurMaterials.push(new UnrealBloomBlurMaterial(kernelSizeArray[i]));
    }

    // Bloom composite material
    console.log("bloom shit", this.renderTargetsVertical);
    this.bloomCompositeMaterial = new BloomCompositeMaterial();
    this.bloomCompositeMaterial.uniforms.tBlur1.value = this.renderTargetsVertical[0].texture;
    this.bloomCompositeMaterial.uniforms.tBlur2.value = this.renderTargetsVertical[1].texture;
    this.bloomCompositeMaterial.uniforms.tBlur3.value = this.renderTargetsVertical[2].texture;
    this.bloomCompositeMaterial.uniforms.tBlur4.value = this.renderTargetsVertical[3].texture;
    this.bloomCompositeMaterial.uniforms.tBlur5.value = this.renderTargetsVertical[4].texture;
    this.bloomCompositeMaterial.uniforms.uBloomFactors.value = this.bloomFactors();

    // Composite materials
    this.sceneCompositeMaterial = new SceneCompositeMaterial();

    this.compositeMaterial = new Composite();
    this.compositeMaterial.uniforms.uFocus.value = this.blurFocus;
    this.compositeMaterial.uniforms.uRotation.value = this.blurRotation;
    this.compositeMaterial.uniforms.uBluriness.value = this.blurFactor;

    // Debug materials
    this.blackoutMaterial = new MeshBasicMaterial({ color: 0x000000 });
    this.matcap1Material = new MeshMatcapMaterial({
      matcap: getTexture("/textures/matcaps/040full.jpg")
    });
    this.matcap2Material = new MeshMatcapMaterial({
      matcap: getTexture("/textures/matcaps/defaultwax.jpg")
    });
    this.normalMaterial = new NormalMaterial();
    this.depthMaterial = new DepthMaterial();
  }

  static bloomFactors(): number[] {
    const bloomFactors: number[] = [1, 0.8, 0.6, 0.4, 0.2];

    for (let i = 0, l = this.nMips; i < l; i++) {
      const factor = bloomFactors[i];
      bloomFactors[i] = this.bloomStrength * MathUtils.lerp(factor, 1.2 - factor, this.bloomRadius);
    }

    return bloomFactors;
  }

  static rendererState(): void {
    this.currentOverrideMaterial = this.scene.overrideMaterial;
    this.currentBackground = this.scene.background;
    this.renderer.getClearColor(this.currentClearColor);
    this.currentClearAlpha = this.renderer.getClearAlpha();
  }

  static restoreRendererState(): void {
    this.scene.overrideMaterial = this.currentOverrideMaterial;
    this.scene.background = this.currentBackground;
    this.renderer.setClearColor(this.currentClearColor, this.currentClearAlpha);
  }

  // Public methods

  static resize(width: number, height: number, dpr: number): void {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);

    width = Math.round(width * dpr);
    height = Math.round(height * dpr);

    this.renderTargetA.setSize(width, height);
    this.renderTargetB.setSize(width, height);
    this.renderTargetC.setSize(width, height);

    this.motionBlur.setSize(width, height);

    this.hBlurMaterial.uniforms.uResolution.value.set(width, height);
    this.vBlurMaterial.uniforms.uResolution.value.set(width, height);

    width = MathUtils.floorPowerOfTwo(width) / 2;
    height = MathUtils.floorPowerOfTwo(height) / 2;

    this.renderTargetBright.setSize(width, height);

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.renderTargetsHorizontal[i].setSize(width, height);
      this.renderTargetsVertical[i].setSize(width, height);

      this.blurMaterials[i].uniforms.uResolution.value.set(width, height);

      width /= 2;
      height /= 2;
    }
  }

  static update(): void {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;

    if (!this.enabled) {
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
      return;
    }

    const renderTargetA = this.renderTargetA;
    const renderTargetB = this.renderTargetB;
    const renderTargetC = this.renderTargetC;
    const renderTargetBright = this.renderTargetBright;
    const renderTargetsHorizontal = this.renderTargetsHorizontal;
    const renderTargetsVertical = this.renderTargetsVertical;

    // Renderer state
    this.rendererState();

    // Scene layer
    camera.layers.set(layers.default);

    renderer.setRenderTarget(renderTargetA);
    renderer.clear();
    renderer.render(scene, camera);

    // Post-processing
    scene.background = null;
    renderer.setClearColor(this.clearColor, 1);

    // Debug override material passes (render to screen)
    if (this.display === DisplayOptions.Depth) {
      scene.overrideMaterial = this.depthMaterial;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
      this.restoreRendererState();
      return;
    } else if (this.display === DisplayOptions.Geometry) {
      scene.overrideMaterial = this.normalMaterial;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
      this.restoreRendererState();
      return;
    } else if (this.display === DisplayOptions.Matcap1) {
      scene.overrideMaterial = this.matcap1Material;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
      this.restoreRendererState();
      return;
    } else if (this.display === DisplayOptions.Matcap2) {
      scene.overrideMaterial = this.matcap2Material;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(scene, camera);
      this.restoreRendererState();
      return;
    }

    // Motion blur layer
    camera.layers.set(layers.velocity);

    if (this.display === DisplayOptions.Velocity) {
      // Debug pass (render to screen)
      this.motionBlur.update(null);
      this.restoreRendererState();
      return;
    } else {
      this.motionBlur.update();
    }

    this.motionBlurCompositeMaterial.uniforms.tMap.value = renderTargetA.texture;
    this.screen.material = this.motionBlurCompositeMaterial;
    renderer.setRenderTarget(renderTargetB);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

    // Extract bright areas
    this.luminosityMaterial.uniforms.tMap.value = renderTargetB.texture;

    if (this.display === DisplayOptions.Luma) {
      // Debug pass (render to screen)
      this.screen.material = this.blackoutMaterial;
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(this.screen, this.screenCamera);
      this.screen.material = this.luminosityMaterial;
      if (Array.isArray(this.screen.material)) {
        this.screen.material.forEach(
          (mat: { blending: number }) => (mat.blending = AdditiveBlending)
        );
      } else {
        this.screen.material.blending = AdditiveBlending;
      }
      renderer.render(this.screen, this.screenCamera);
      this.restoreRendererState();
      return;
    } else {
      this.screen.material = this.luminosityMaterial;
      if (Array.isArray(this.screen.material)) {
        this.screen.material.forEach((mat: { blending: number }) => (mat.blending = NoBlending));
      } else {
        this.screen.material.blending = NoBlending;
      }
      renderer.setRenderTarget(renderTargetBright);
      renderer.clear();
      renderer.render(this.screen, this.screenCamera);
    }

    // Blur all the mips progressively
    let inputRenderTarget = renderTargetBright;

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.screen.material = this.blurMaterials[i];

      this.blurMaterials[i].uniforms.tMap.value = inputRenderTarget.texture;
      this.blurMaterials[i].uniforms.uDirection.value = BlurDirectionX;
      renderer.setRenderTarget(renderTargetsHorizontal[i]);
      renderer.clear();
      renderer.render(this.screen, this.screenCamera);

      this.blurMaterials[i].uniforms.tMap.value = this.renderTargetsHorizontal[i].texture;
      this.blurMaterials[i].uniforms.uDirection.value = BlurDirectionY;
      renderer.setRenderTarget(renderTargetsVertical[i]);
      renderer.clear();
      renderer.render(this.screen, this.screenCamera);

      inputRenderTarget = renderTargetsVertical[i];
    }

    // Composite all the mips
    this.screen.material = this.bloomCompositeMaterial;

    if (this.display === DisplayOptions.Bloom) {
      // Debug pass (render to screen)
      renderer.setRenderTarget(null);
      renderer.clear();
      renderer.render(this.screen, this.screenCamera);
      this.restoreRendererState();
      return;
    } else {
      renderer.setRenderTarget(renderTargetsHorizontal[0]);
      renderer.clear();
      renderer.render(this.screen, this.screenCamera);
    }

    // Scene composite pass
    this.sceneCompositeMaterial.uniforms.tScene.value = renderTargetB.texture;
    this.sceneCompositeMaterial.uniforms.tBloom.value = renderTargetsHorizontal[0].texture;
    this.screen.material = this.sceneCompositeMaterial;
    renderer.setRenderTarget(renderTargetC);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

    // Two pass Gaussian blur (horizontal and vertical)
    if (this.blurFactor) {
      this.hBlurMaterial.uniforms.tMap.value = renderTargetC.texture;
      this.hBlurMaterial.uniforms.uBluriness.value = this.blurFactor;
      this.screen.material = this.hBlurMaterial;
      renderer.setRenderTarget(renderTargetA);
      renderer.clear();
      renderer.render(this.screen, this.screenCamera);

      this.vBlurMaterial.uniforms.tMap.value = renderTargetA.texture;
      this.vBlurMaterial.uniforms.uBluriness.value = this.blurFactor;
      this.screen.material = this.vBlurMaterial;
      renderer.setRenderTarget(renderTargetC);
      renderer.clear();
      renderer.render(this.screen, this.screenCamera);
    }

    // Composite pass (render to screen)
    this.compositeMaterial.uniforms.tScene.value = renderTargetC.texture;
    this.compositeMaterial.uniforms.uBluriness.value = this.blurFactor;
    this.screen.material = this.compositeMaterial;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

    // Restore renderer settings
    this.restoreRendererState();
  }

  static start(): void {
    this.blurFactor = 0;
  }

  public static zoomIn(): void {
    clearTween(this.timeout);

    this.timeout = delayedCall(300, () => {
      tween(this, { blurFactor: 1 }, 1000, "easeOutBack");
    });
  }

  public static zoomOut(): void {
    clearTween(this.timeout);

    tween(this, { blurFactor: 0 }, 300, "linear");
  }
}

export default RenderManager;
