"use client";

import {
  EnvironmentTextureLoader,
  GLTFLoader,
  OrbitControls,
  TextureLoader,
  getFullscreenTriangle
} from "@alienkitty/alien.js/all/three";
import {
  Color,
  ColorManagement,
  DirectionalLight,
  HemisphereLight,
  LinearSRGBColorSpace,
  PerspectiveCamera,
  Scene,
  Vector2,
  WebGLRenderer
} from "three";
import { DRACOLoader } from "three-stdlib";
// @ts-expect-error - no types available
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

const layers = {
  default: 0,
  hologram: 1,
  glow: 2
};

class WorldController {
  static renderer: WebGLRenderer;
  static element: HTMLCanvasElement;
  static scene: Scene & { environmentIntensity?: number };
  static camera: PerspectiveCamera;
  static controls: typeof OrbitControls;
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
    this.initControls();
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

    // 3D scene
    this.scene = new Scene();
    this.scene.background = new Color(0x060606);
    this.camera = new PerspectiveCamera(30);
    this.camera.near = 0.5;
    this.camera.far = 40;
    this.camera.position.set(0, 1, 4);
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
    // this.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
  }

  static initLights() {
    const hemisphereLight = new HemisphereLight(0x606060, 0x404040, 3);

    const directionalLight = new DirectionalLight(0xffffff, 2);
    directionalLight.position.set(0.6, 0.5, 1);

    this.scene.add(hemisphereLight);
    this.scene.add(directionalLight);

    // Important: Make sure your lights are on!
    hemisphereLight.layers.enable(layers.hologram);
    directionalLight.layers.enable(layers.hologram);
    hemisphereLight.layers.enable(layers.glow);
    directionalLight.layers.enable(layers.glow);
  }

  static initLoaders() {
    this.textureLoader = new TextureLoader();
    this.textureLoader.cache = true;

    this.gltfLoader = new GLTFLoader();
    const dracoloader = new DRACOLoader();
    dracoloader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    this.gltfLoader.setDRACOLoader(dracoloader);

    this.environmentLoader = new EnvironmentTextureLoader(this.renderer);
    this.environmentLoader.cache = true;
  }

  static async initEnvironment() {
    this.scene.environment = await this.loadEnvironmentTexture(
      "./textures/env/jewelry_black_contrast.jpg"
    );
    this.scene.environmentIntensity = 0.5;
  }

  static initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    // this.controls.enableZoom = false;
  }

  static initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    // this.controls.enableZoom = false;
  }

  static addListeners() {
    this.renderer.domElement.addEventListener("touchstart", this.onTouchStart);
  }

  // Event handlers

  static onTouchStart = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };

  // Public methods

  static resize = (width: number, height: number, dpr: number) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    if (width < height) {
      this.camera.position.z = 7;
    } else {
      this.camera.position.z = 5;
    }

    width = Math.round(width * dpr);
    height = Math.round(height * dpr);

    this.resolution.value.set(width, height);
    this.texelSize.value.set(1 / width, 1 / height);
    this.aspect.value = width / height;
  };

  static update = (time: number, delta: number, frame: number) => {
    this.time.value = time;
    this.frame.value = frame;
    this.controls.update();
  };

  // Global handlers

  static getTexture = (path: string, callback: void) => this.textureLoader.load(path, callback);

  static loadTexture = (path: string) => this.textureLoader.loadAsync(path);

  static loadGLTF = (path: string) => this.gltfLoader.loadAsync(path);

  static loadEnvironmentTexture = (path: string) => this.environmentLoader.loadAsync(path);
}

export default WorldController;
