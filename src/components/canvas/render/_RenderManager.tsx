"use client";

import {
  BloomCompositeMaterial,
  BlurMaterial,
  ChromaticAberrationMaterial,
  DepthMaterial,
  DisplayOptions,
  LuminosityMaterial,
  MotionBlur,
  MotionBlurCompositeMaterial,
  NormalMaterial,
  Renderer,
  SceneCompositeMaterial,
  UnrealBloomBlurMaterial,
  VideoGlitchMaterial
} from "@alienkitty/alien.js/all/three";
import blendScreen from "@alienkitty/alien.js/src/shaders/modules/blending/screen.glsl.js";
import blendSoftLight from "@alienkitty/alien.js/src/shaders/modules/blending/soft-light.glsl.js";
import {
  AdditiveBlending,
  Camera,
  Color,
  GLSL3,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshMatcapMaterial,
  NoBlending,
  OrthographicCamera,
  RawShaderMaterial,
  Scene,
  Vector2,
  WebGLRenderTarget,
  WebGLRenderer
} from "three";

import { Blur } from "@/components/canvas/materials";
import { WorldController } from "@/components/canvas/world";

class CompositeMaterial extends RawShaderMaterial {
  constructor() {
    super({
      glslVersion: GLSL3,
      uniforms: {
        tScene: { value: null },
        tHologram: { value: null },
        tGlow: { value: null }
      },
      vertexShader: /* glsl */ `
              in vec3 position;
              in vec2 uv;

              out vec2 vUv;

              void main() {
                  vUv = uv;

                  gl_Position = vec4(position, 1.0);
              }
          `,
      fragmentShader: /* glsl */ `
              precision highp float;

              uniform sampler2D tScene;
              uniform sampler2D tHologram;
              uniform sampler2D tGlow;

              in vec2 vUv;

              out vec4 FragColor;

              ${blendScreen}
              ${blendSoftLight}

              void main() {
                  vec4 base = texture(tScene, vUv);
                  vec4 blend = texture(tHologram, vUv);

                  // Blend soft light with background color
                  blend = blendSoftLight(blend, vec4(vec3(0.11), 1.0), 0.75);

                  FragColor = blendScreen(base, blend, 1.0);

                  base = FragColor;
                  blend = texture(tGlow, vUv);

                  FragColor = blendScreen(base, blend, 1.0);
              }
          `,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false
    });
  }
}

const layers = {
  default: 0,
  hologram: 1,
  glow: 2
};

const BlurDirectionX = new Vector2(1, 0);
const BlurDirectionY = new Vector2(0, 1);

class RenderManager {
  static renderer: typeof Renderer;
  static scene: Scene;
  static camera: Camera;

  static glitchDistortion: number;
  static glitchDistortion2: number;
  static glitchSpeed: number;
  static blurResolutionScale: number;

  static blurFocus: number;
  static blurRotation: number;
  static blurFactor: number;
  static luminosityThreshold: number;
  static luminositySmoothing: number;
  static bloomStrength: number;
  static bloomRadius: number;

  static caBlueOffset: number;
  static caGreenOffset: number;
  static caRedOffset: number;
  static caIntensity: number;

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
  static renderTargetHologram: WebGLRenderTarget;
  static renderTargetBlurA: WebGLRenderTarget;
  static renderTargetBlurB: WebGLRenderTarget;
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
  static videoGlitchMaterial: typeof VideoGlitchMaterial;
  static bloomCompositeMaterial: typeof BloomCompositeMaterial;
  static sceneCompositeMaterial: typeof SceneCompositeMaterial;
  static compositeMaterial: CompositeMaterial;
  static blackoutMaterial: MeshBasicMaterial;
  static matcap1Material: MeshMatcapMaterial;
  static matcap2Material: MeshMatcapMaterial;
  static normalMaterial: typeof NormalMaterial;
  static depthMaterial: typeof DepthMaterial;
  static caMaterial: typeof ChromaticAberrationMaterial;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static currentOverrideMaterial: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static currentBackground: any;
  static currentClearAlpha: number;
  static timeout: number;

  static init(renderer: WebGLRenderer, scene: Scene, camera: Camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // Hologram
    this.glitchDistortion = 0.15;
    this.glitchDistortion2 = 0.04;
    this.glitchSpeed = 0.01;
    this.blurResolutionScale = 0.25;
    this.blurFactor = 1.5;

    // Bloom
    this.luminosityThreshold = 1;
    this.luminositySmoothing = 1;
    this.bloomStrength = 0.97;
    this.bloomRadius = 0.3;

    // Chromatic aberration
    this.caRedOffset = 0;
    this.caGreenOffset = 4;
    this.caBlueOffset = 0;
    this.caIntensity = 1.5;

    this.enabled = true;

    this.initRenderer();
  }

  static initRenderer() {
    const { screenTriangle, time } = WorldController;

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
    this.renderTargetHologram = this.renderTargetA.clone();

    this.renderTargetBlurA = this.renderTargetA.clone();
    this.renderTargetBlurB = this.renderTargetA.clone();

    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;

    this.renderTargetBright = this.renderTargetA.clone();

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.renderTargetsHorizontal.push(this.renderTargetA.clone());
      this.renderTargetsVertical.push(this.renderTargetA.clone());
    }

    this.renderTargetA.depthBuffer = true;
    this.renderTargetHologram.depthBuffer = true;
    this.renderTargetBlurA.depthBuffer = true;

    // Occlusion material
    this.blackoutMaterial = new MeshBasicMaterial({ color: 0x000000 });

    // Video glitch material
    this.videoGlitchMaterial = new VideoGlitchMaterial();
    this.videoGlitchMaterial.uniforms.uDistortion.value = this.glitchDistortion;
    this.videoGlitchMaterial.uniforms.uDistortion2.value = this.glitchDistortion2;
    this.videoGlitchMaterial.uniforms.uSpeed.value = this.glitchSpeed;
    this.videoGlitchMaterial.uniforms.uTime = time;

    // Gaussian blur materials
    this.hBlurMaterial = new BlurMaterial(BlurDirectionX);
    this.hBlurMaterial.uniforms.uBluriness.value = this.blurFactor;

    this.vBlurMaterial = new BlurMaterial(BlurDirectionY);
    this.vBlurMaterial.uniforms.uBluriness.value = this.blurFactor;

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
    this.bloomCompositeMaterial = new BloomCompositeMaterial();
    this.bloomCompositeMaterial.uniforms.tBlur1.value = this.renderTargetsVertical[0].texture;
    this.bloomCompositeMaterial.uniforms.tBlur2.value = this.renderTargetsVertical[1].texture;
    this.bloomCompositeMaterial.uniforms.tBlur3.value = this.renderTargetsVertical[2].texture;
    this.bloomCompositeMaterial.uniforms.tBlur4.value = this.renderTargetsVertical[3].texture;
    this.bloomCompositeMaterial.uniforms.tBlur5.value = this.renderTargetsVertical[4].texture;
    this.bloomCompositeMaterial.uniforms.uBloomFactors.value = this.bloomFactors();

    // Blend it additively
    this.bloomCompositeMaterial.blending = AdditiveBlending;

    // Composite material
    this.compositeMaterial = new CompositeMaterial();

    // Chromatic aberration material
    this.caMaterial = new ChromaticAberrationMaterial();
    this.caMaterial.uniforms.uRedOffset.value = this.caRedOffset;
    this.caMaterial.uniforms.uGreenOffset.value = this.caGreenOffset;
    this.caMaterial.uniforms.uBlueOffset.value = this.caBlueOffset;
    this.caMaterial.uniforms.uIntensity.value = this.caIntensity;
  }

  static bloomFactors() {
    const bloomFactors = [1, 0.8, 0.6, 0.4, 0.2];

    for (let i = 0, l = this.nMips; i < l; i++) {
      const factor = bloomFactors[i];
      bloomFactors[i] = this.bloomStrength * MathUtils.lerp(factor, 1.2 - factor, this.bloomRadius);
    }

    return bloomFactors;
  }

  // Public methods

  static resize = (width: number, height: number, dpr: number) => {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);

    width = Math.round(width * dpr);
    height = Math.round(height * dpr);

    this.renderTargetA.setSize(width, height);
    this.renderTargetB.setSize(width, height);
    this.renderTargetC.setSize(width, height);
    this.renderTargetHologram.setSize(width, height);

    // Gaussian blur
    const blurWidth = Math.round(width * this.blurResolutionScale);
    const blurHeight = Math.round(height * this.blurResolutionScale);

    this.renderTargetBlurA.setSize(blurWidth, blurHeight);
    this.renderTargetBlurB.setSize(blurWidth, blurHeight);

    this.hBlurMaterial.uniforms.uResolution.value.set(blurWidth, blurHeight);
    this.vBlurMaterial.uniforms.uResolution.value.set(blurWidth, blurHeight);

    // Unreal bloom
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
  };

  static update = () => {
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
    const renderTargetHologram = this.renderTargetHologram;
    const renderTargetBlurA = this.renderTargetBlurA;
    const renderTargetBlurB = this.renderTargetBlurB;
    const renderTargetBright = this.renderTargetBright;
    const renderTargetsHorizontal = this.renderTargetsHorizontal;
    const renderTargetsVertical = this.renderTargetsVertical;

    // Renderer state
    const currentOverrideMaterial = scene.overrideMaterial;
    const currentBackground = scene.background;
    renderer.getClearColor(this.currentClearColor);
    const currentClearAlpha = renderer.getClearAlpha();

    // Scene layer
    camera.layers.set(layers.default);

    renderer.setRenderTarget(renderTargetA);
    renderer.clear();
    renderer.render(scene, camera);

    // Hologram layer
    scene.background = null;
    renderer.setClearColor(this.clearColor, 1);

    scene.overrideMaterial = this.blackoutMaterial;
    renderer.setRenderTarget(renderTargetHologram);
    renderer.clear();
    renderer.render(scene, camera);
    scene.overrideMaterial = currentOverrideMaterial;

    camera.layers.set(layers.hologram);

    renderer.render(scene, camera);

    this.videoGlitchMaterial.uniforms.tMap.value = renderTargetHologram.texture;
    this.screen.material = this.videoGlitchMaterial;
    renderer.setRenderTarget(renderTargetB);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

    // Glow layer
    camera.layers.set(layers.default);

    scene.overrideMaterial = this.blackoutMaterial;
    renderer.setRenderTarget(renderTargetBlurA);
    renderer.clear();
    renderer.render(scene, camera);
    scene.overrideMaterial = currentOverrideMaterial;

    camera.layers.set(layers.glow);

    renderer.render(scene, camera);

    // Restore renderer settings
    scene.background = currentBackground;
    renderer.setClearColor(this.currentClearColor, currentClearAlpha);

    this.hBlurMaterial.uniforms.tMap.value = renderTargetBlurA.texture;
    this.screen.material = this.hBlurMaterial;
    renderer.setRenderTarget(renderTargetBlurB);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

    this.vBlurMaterial.uniforms.tMap.value = renderTargetBlurB.texture;
    this.screen.material = this.vBlurMaterial;
    renderer.setRenderTarget(renderTargetBlurA);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

    this.videoGlitchMaterial.uniforms.tMap.value = renderTargetBlurA.texture;
    this.screen.material = this.videoGlitchMaterial;
    renderer.setRenderTarget(renderTargetBlurB);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

    // Scene composite pass
    this.compositeMaterial.uniforms.tScene.value = renderTargetA.texture;
    this.compositeMaterial.uniforms.tHologram.value = renderTargetB.texture;
    this.compositeMaterial.uniforms.tGlow.value = renderTargetBlurB.texture;
    this.screen.material = this.compositeMaterial;
    renderer.setRenderTarget(renderTargetC);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

    // Extract bright areas
    this.luminosityMaterial.uniforms.tMap.value = renderTargetC.texture;
    this.screen.material = this.luminosityMaterial;
    renderer.setRenderTarget(renderTargetBright);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);

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
    renderer.setRenderTarget(renderTargetC);
    renderer.render(this.screen, this.screenCamera);

    // Chromatic aberration pass (render to screen)
    this.caMaterial.uniforms.tMap.value = renderTargetC.texture;
    this.screen.material = this.caMaterial;
    renderer.setRenderTarget(null);
    renderer.clear();
    renderer.render(this.screen, this.screenCamera);
  };
}

export default RenderManager;
