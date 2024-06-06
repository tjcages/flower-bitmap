"use client";

import {
  EnvironmentTextureLoader,
  GLTFLoader,
  TextureLoader,
  getFullscreenTriangle
} from "@alienkitty/alien.js/all/three";
import {
  BasicShadowMap,
  Color,
  ColorManagement,
  DirectionalLight,
  Fog,
  HemisphereLight,
  LinearSRGBColorSpace,
  PerspectiveCamera,
  Scene,
  Texture,
  Vector2,
  WebGLRenderer
} from "three";
import { DRACOLoader } from "three-stdlib";
// @ts-expect-error - no types available
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

class WorldController {
  static renderer: WebGLRenderer;
  static element: HTMLCanvasElement;
  static scene: Scene & { environmentIntensity: number };
  static camera: PerspectiveCamera;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static screenTriangle: any; // Define the correct type if available
  private static resolution: { value: Vector2 };
  private static texelSize: { value: Vector2 };
  private static aspect: { value: number };
  static time: { value: number };
  private static frame: { value: number };
  static anisotropy: number;
  static textureLoader: typeof TextureLoader;
  static gltfLoader: typeof GLTFLoader;
  static environmentLoader: typeof EnvironmentTextureLoader;
  static svgLoader: SVGLoader;

  static init() {
    this.initWorld();
    this.initLights();
    this.initLoaders();
    this.initEnvironment();

    this.addListeners();
  }

  static initWorld() {
    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      canvas: document.querySelector("#canvas") || undefined
    });

    // Disable color management
    ColorManagement.enabled = false;
    this.renderer.outputColorSpace = LinearSRGBColorSpace;

    // Output canvas
    this.element = this.renderer.domElement;

    // Shadows
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = BasicShadowMap;

    // 3D scene
    this.scene = new Scene() as Scene & { environmentIntensity: number };
    this.scene.background = new Color(0x0e0e0e);

    this.scene.fog = new Fog(0x0e0e0e, 1, 30); // Color, near, far

    this.camera = new PerspectiveCamera(30);
    this.camera.near = 0.5;
    this.camera.far = 40;
    this.camera.position.set(0, 6, 8);
    this.camera.lookAt(this.scene.position);

    // Global geometries
    this.screenTriangle = getFullscreenTriangle();

    // Global uniforms
    this.resolution = { value: new Vector2() };
    this.texelSize = { value: new Vector2() };
    this.aspect = { value: 1 };
    this.time = { value: 0 };
    this.frame = { value: 0 };

    // Global settings
    this.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
  }

  static initLights() {
    this.scene.add(new HemisphereLight(0x606060, 0x404040, 3));

    const light = new DirectionalLight(0xffffff, 8);
    light.position.set(5, 5, 5);
    light.castShadow = true;
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    this.scene.add(light);
  }

  static initLoaders() {
    this.textureLoader = new TextureLoader();
    // this.textureLoader.cache = true;
    this.textureLoader.setPath("/");

    this.gltfLoader = new GLTFLoader();
    const dracoloader = new DRACOLoader();
    dracoloader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    this.gltfLoader.setDRACOLoader(dracoloader);

    this.svgLoader = new SVGLoader();

    this.environmentLoader = new EnvironmentTextureLoader(this.renderer);
    this.environmentLoader.cache = true;
    this.environmentLoader.setPath("/");
  }

  static async initEnvironment() {
    this.scene.environment = await this.loadEnvironmentTexture(
      "./textures/env/jewelry_black_contrast.jpg"
    );
    this.scene.environmentIntensity = 1.2;
  }

  static addListeners() {
    this.renderer.domElement.addEventListener("touchstart", this.onTouchStart);
  }

  // Event handlers

  static onTouchStart = (e: TouchEvent) => {
    e.preventDefault();
  };

  // Public methods

  static resize = (width: number, height: number, dpr: number) => {
    width = Math.round(width * dpr);
    height = Math.round(height * dpr);

    this.resolution.value.set(width, height);
    this.texelSize.value.set(1 / width, 1 / height);
    this.aspect.value = width / height;
  };

  static update = (time: number, delta: number, frame: number) => {
    this.time.value = time;
    this.frame.value = frame;
  };

  // Global handlers

  static getTexture = (path: string, callback?: (texture: Texture) => void) =>
    this.textureLoader.load(path, callback);

  static loadTexture = (path: string) => this.textureLoader.loadAsync(path);

  static loadGLTF = (path: string) => this.gltfLoader.loadAsync(path);

  static loadSVG = (path: string) => this.svgLoader.loadAsync(path);

  static loadEnvironmentTexture = (path: string) => this.environmentLoader.loadAsync(path);
}

export default WorldController;
