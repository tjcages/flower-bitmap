"use client";

// @ts-expect-error - Ignore import error
import rgbshift from "@alienkitty/alien.js/src/shaders/modules/rgbshift/rgbshift.glsl.js";
import {
  BloomCompositeMaterial,
  Fluid,
  LuminosityMaterial,
  Reflector,
  SceneCompositeDistortionMaterial,
  UnrealBloomBlurMaterial // @ts-expect-error - Ignore import error
} from "@alienkitty/alien.js/src/three";
import { PanelItem } from "@alienkitty/space.js/src/panels/PanelItem.js";
import { ticker } from "@alienkitty/space.js/src/tween/Ticker.js";
import { UI } from "@alienkitty/space.js/src/ui/UI.js";
import { useEffect } from "react";
import {
  AdditiveBlending,
  BufferGeometry,
  Color,
  ColorManagement,
  DirectionalLight,
  Float32BufferAttribute,
  Fog,
  GLSL3,
  Group,
  HemisphereLight,
  LinearSRGBColorSpace,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OrthographicCamera,
  PerspectiveCamera,
  PlaneGeometry,
  RawShaderMaterial,
  RepeatWrapping,
  Scene,
  ShapeGeometry,
  TextureLoader,
  Vector2,
  Vector3,
  WebGLRenderTarget,
  WebGLRenderer
} from "three";
import { SVGLoader } from "three/addons/loaders/SVGLoader.js";

function getFullscreenTriangle() {
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute([-1, 3, 0, -1, -1, 0, 3, -1, 0], 3));
  geometry.setAttribute("uv", new Float32BufferAttribute([0, 2, 0, 0, 2, 0], 2));

  return geometry;
}

function getFrustum(camera, offsetZ = 0) {
  const distance = camera.position.z - offsetZ;
  const fov = MathUtils.degToRad(camera.fov);
  const height = 2 * Math.tan(fov / 2) * distance;
  const width = height * camera.aspect;

  return { width, height };
}

class FluidMaterial extends RawShaderMaterial {
  constructor() {
    super({
      glslVersion: GLSL3,
      uniforms: {
        tMap: { value: null },
        tFluid: { value: null }
      },
      vertexShader: /* glsl */ `
                  in vec3 position;
                  in vec2 uv;

                  uniform mat4 modelViewMatrix;
                  uniform mat4 projectionMatrix;

                  out vec2 vUv;

                  void main() {
                      vUv = uv;

                      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                  }
              `,
      fragmentShader: /* glsl */ `
                  precision highp float;

                  uniform sampler2D tMap;
                  uniform sampler2D tFluid;

                  in vec2 vUv;

                  out vec4 FragColor;

                  ${rgbshift}

                  void main() {
                      vec3 fluid = texture(tFluid, vUv).rgb;
                      vec2 uv = vUv - fluid.rg * 0.0003;

                      vec2 dir = 25.0 - vUv;
                      float angle = atan(dir.y, dir.x);
                      float amount = length(fluid.rg) * 0.00025;

                      FragColor = getRGB(tMap, uv, angle, amount);
                      FragColor.a = 1.0;
                  }
              `,
      blending: AdditiveBlending
    });
  }
}

class Triangle extends Group {
  constructor() {
    super();
  }

  async initMesh() {
    const { loadSVG } = WorldController;

    // Fetch the SVG data from the provided URL
    const svgDataURL = "/totem.svg";
    const svgData = await fetch(svgDataURL);
    const svgText = await svgData.text();

    // Load the SVG data
    const data = await loadSVG(`data:image/svg+xml,${encodeURIComponent(svgText)}`);

    const paths = data.paths;

    const group = new Group();
    group.scale.y *= -1;
    group.scale.multiplyScalar(0.002);
    group.position.set(-2, 0, 0);

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];

      const material = new MeshBasicMaterial();
      const shapes = SVGLoader.createShapes(path);

      for (let j = 0; j < shapes.length; j++) {
        const shape = shapes[j];
        const geometry = new ShapeGeometry(shape);
        const mesh = new Mesh(geometry, material);
        group.add(mesh);
      }
    }

    this.add(group);
  }
}

class TriangleView extends Group {
  constructor() {
    super();

    this.width = 8;
    this.height = 3;
    this.isLoaded = false;

    this.initRenderer();
    this.initMesh();
    this.initViews();
  }

  initRenderer() {
    const { renderer, aspect } = WorldController;

    this.renderer = renderer;

    // 2D scene
    this.scene = new Scene();
    this.camera = new OrthographicCamera(
      -this.width / 2,
      this.width / 2,
      this.height / 2,
      -this.height / 2,
      0,
      1
    );

    // Render targets
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      depthBuffer: false
    });

    // Fluid simulation
    this.fluid = new Fluid(this.renderer, {
      iterations: 10,
      curlStrength: 40,
      pressureDissipation: 0.5,
      velocityDissipation: 0.85,
      densityDissipation: 0.95,
      radius: 0.8
    });
    this.fluid.splatMaterial.uniforms.uAspect = aspect;
  }

  initMesh() {
    const { camera, quad } = WorldController;

    const material = new FluidMaterial();
    material.uniforms.tMap.value = this.renderTarget.texture;
    material.uniforms.tFluid = this.fluid.uniform;

    const mesh = new Mesh(quad, material);
    mesh.position.set(0, 0.9, 0);
    mesh.scale.set(this.width, this.height, 1);
    mesh.lookAt(camera.position);
    mesh.renderOrder = 1; // Render last

    this.add(mesh);

    this.mesh = mesh;
  }

  initViews() {
    this.triangle = new Triangle();

    // Reduce size to make room for fluid dissipation
    this.triangle.scale.multiplyScalar(0.8);

    this.scene.add(this.triangle);
  }

  // Public methods

  resize = (width, height, dpr) => {
    const frustum = WorldController.getFrustum(this.mesh.position.z);

    this.widthResolutionScale = this.width / frustum.width;
    this.heightResolutionScale = this.height / frustum.height;

    width = Math.round(width * dpr * this.widthResolutionScale);
    height = Math.round(height * dpr * this.heightResolutionScale);

    this.renderTarget.setSize(width, height);

    if (this.isLoaded) {
      this.update();
    }
  };

  update = () => {
    // Render a single frame for the triangle texture
    const currentRenderTarget = this.renderer.getRenderTarget();

    // Scene pass
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    // Restore renderer settings
    this.renderer.setRenderTarget(currentRenderTarget);
  };

  ready = async () => {
    await this.triangle.initMesh();

    this.isLoaded = true;

    this.update();
  };
}

class Floor extends Group {
  constructor() {
    super();

    this.initReflector();
  }

  initReflector() {
    this.reflector = new Reflector();
  }

  async initMesh() {
    const { loadTexture } = WorldController;

    const geometry = new PlaneGeometry(100, 100);

    // Second set of UVs for aoMap and lightMap
    // https://threejs.org/docs/#api/en/materials/MeshStandardMaterial.aoMap
    geometry.attributes.uv1 = geometry.attributes.uv;

    // Textures
    const [map, normalMap, ormMap] = await Promise.all([
      // loadTexture('../assets/textures/uv.jpg'),
      loadTexture("/textures/pbr/polished_concrete_basecolor.jpg"),
      loadTexture("/textures/pbr/polished_concrete_normal.jpg"),
      // https://occlusion-roughness-metalness.glitch.me/
      loadTexture("/textures/pbr/polished_concrete_orm.jpg")
    ]);

    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(32, 32);

    normalMap.wrapS = RepeatWrapping;
    normalMap.wrapT = RepeatWrapping;
    normalMap.repeat.set(16, 16);

    ormMap.wrapS = RepeatWrapping;
    ormMap.wrapT = RepeatWrapping;
    ormMap.repeat.set(16, 16);

    const material = new MeshStandardMaterial({
      color: new Color().offsetHSL(0, 0, -0.85),
      metalness: 1,
      roughness: 0.5,
      map,
      metalnessMap: ormMap,
      roughnessMap: ormMap,
      aoMap: ormMap,
      aoMapIntensity: 1,
      normalMap,
      normalScale: new Vector2(3, 3)
    });

    // Second channel for aoMap and lightMap
    // https://threejs.org/docs/#api/en/materials/MeshStandardMaterial.aoMap
    material.aoMap.channel = 1;

    const uniforms = {
      mirror: { value: 0 },
      mixStrength: { value: 10 }
    };

    material.onBeforeCompile = shader => {
      shader.uniforms.reflectMap = this.reflector.renderTargetUniform;
      shader.uniforms.textureMatrix = this.reflector.textureMatrixUniform;

      shader.uniforms = Object.assign(shader.uniforms, uniforms);

      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        /* glsl */ `
                  uniform mat4 textureMatrix;
                  out vec4 vCoord;
                  out vec3 vToEye;

                  void main() {
                  `
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        /* glsl */ `
                  #include <project_vertex>

                  vCoord = textureMatrix * vec4(transformed, 1.0);
                  vToEye = cameraPosition - (modelMatrix * vec4(transformed, 1.0)).xyz;
                  `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        /* glsl */ `
                  uniform sampler2D reflectMap;
                  uniform float mirror;
                  uniform float mixStrength;
                  in vec4 vCoord;
                  in vec3 vToEye;

                  void main() {
                  `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "#include <emissivemap_fragment>",
        /* glsl */ `
                  #include <emissivemap_fragment>

                  vec4 normalColor = texture2D(normalMap, vNormalMapUv * normalScale);
                  vec3 reflectNormal = normalize(vec3(normalColor.r * 2.0 - 1.0, normalColor.b, normalColor.g * 2.0 - 1.0));
                  vec3 reflectCoord = vCoord.xyz / vCoord.w;
                  vec2 reflectUv = reflectCoord.xy + reflectCoord.z * reflectNormal.xz * 0.05;
                  vec4 reflectColor = texture2D(reflectMap, reflectUv);

                  // Fresnel term
                  vec3 toEye = normalize(vToEye);
                  float theta = max(dot(toEye, normal), 0.0);
                  float reflectance = pow((1.0 - theta), 5.0);

                  reflectColor = mix(vec4(0), reflectColor, reflectance);

                  diffuseColor.rgb = diffuseColor.rgb * ((1.0 - min(1.0, mirror)) + reflectColor.rgb * mixStrength);
                  `
      );
    };

    const mesh = new Mesh(geometry, material);
    mesh.position.y = -0.75;
    mesh.rotation.x = -Math.PI / 2;
    mesh.add(this.reflector);

    mesh.onBeforeRender = (renderer, scene, camera) => {
      this.visible = false;
      this.reflector.update(renderer, scene, camera);
      this.visible = true;
    };

    this.add(mesh);
  }

  // Public methods

  resize = (width, height) => {
    width = MathUtils.floorPowerOfTwo(width) / 2;
    height = 1024;

    this.reflector.setSize(width, height);
  };
}

class SceneView extends Group {
  constructor() {
    super();

    this.visible = false;

    this.initViews();
  }

  initViews() {
    this.floor = new Floor();
    this.add(this.floor);

    this.triangle = new TriangleView();
    this.add(this.triangle);
  }

  // Public methods

  resize = (width, height, dpr) => {
    this.floor.resize(width, height);
    this.triangle.resize(width, height, dpr);
  };

  ready = () => Promise.all([this.floor.initMesh(), this.triangle.ready()]);
}

class SceneController {
  static init(camera, view) {
    this.camera = camera;
    this.view = view;

    // Fluid simulation
    this.lastMouse = new Vector2();

    this.triangleWorldPosition = new Vector3();
    this.screenSpacePosition = new Vector3();

    this.addListeners();
  }

  static addListeners() {
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
  }

  // Event handlers

  static onPointerDown = e => {
    this.onPointerMove(e);
  };

  static onPointerMove = ({ clientX, clientY }) => {
    if (!this.view.visible) {
      return;
    }

    const event = {
      x: clientX,
      y: clientY
    };

    // Adjust for triangle screen space
    const halfWidth = this.width / 2;
    const halfHeight = this.height / 2;
    const triangleWidth = Math.round(this.width * this.view.triangle.widthResolutionScale);
    const triangleHeight = Math.round(this.height * this.view.triangle.heightResolutionScale);
    const triangleHalfWidth = triangleWidth / 2;
    const triangleHalfHeight = triangleHeight / 2;

    this.triangleWorldPosition.setFromMatrixPosition(this.view.triangle.mesh.matrixWorld);
    this.screenSpacePosition.copy(this.triangleWorldPosition).project(this.camera);

    this.screenSpacePosition.x =
      this.screenSpacePosition.x * halfWidth + halfWidth - triangleHalfWidth;
    this.screenSpacePosition.y =
      -(this.screenSpacePosition.y * halfHeight) + halfHeight - triangleHalfHeight;

    // First input
    if (!this.lastMouse.isInit) {
      this.lastMouse.isInit = true;
      this.lastMouse.copy(event);
    }

    const deltaX = event.x - this.lastMouse.x;
    const deltaY = event.y - this.lastMouse.y;

    this.lastMouse.copy(event);

    // Add if the mouse is moving
    if (Math.abs(deltaX) || Math.abs(deltaY)) {
      // Update fluid simulation inputs
      this.view.triangle.fluid.splats.push({
        // Get mouse value in 0 to 1 range, with Y flipped
        x: MathUtils.mapLinear(
          event.x,
          this.screenSpacePosition.x,
          this.screenSpacePosition.x + triangleWidth,
          0,
          1
        ),
        y:
          1 -
          MathUtils.mapLinear(
            event.y,
            this.screenSpacePosition.y,
            this.screenSpacePosition.y + triangleHeight,
            0,
            1
          ),
        dx: deltaX * 5,
        dy: deltaY * -5
      });
    }
  };

  static onPointerUp = e => {
    this.onPointerMove(e);
  };

  // Public methods

  static resize = (width, height, dpr) => {
    this.width = width;
    this.height = height;

    this.view.resize(width, height, dpr);
  };

  static update = () => {
    // Perform all of the fluid simulation renders
    this.view.triangle.fluid.update();
  };

  static animateIn = () => {
    this.view.visible = true;
  };

  static ready = () => this.view.ready();
}

class PanelController {
  static init(view, ui) {
    this.view = view;
    this.ui = ui;

    this.initPanel();
  }

  static initPanel() {
    const { triangle } = this.view;

    const { luminosityMaterial, bloomCompositeMaterial, compositeMaterial } = RenderManager;

    const items = [
      {
        name: "FPS"
      },
      {
        type: "divider"
      },
      {
        type: "slider",
        name: "Iterate",
        min: 0,
        max: 10,
        step: 1,
        value: triangle.fluid.iterations,
        callback: value => {
          triangle.fluid.iterations = value;
        }
      },
      {
        type: "slider",
        name: "Density",
        min: 0,
        max: 1,
        step: 0.01,
        value: triangle.fluid.densityDissipation,
        callback: value => {
          triangle.fluid.densityDissipation = value;
        }
      },
      {
        type: "slider",
        name: "Velocity",
        min: 0,
        max: 1,
        step: 0.01,
        value: triangle.fluid.velocityDissipation,
        callback: value => {
          triangle.fluid.velocityDissipation = value;
        }
      },
      {
        type: "slider",
        name: "Pressure",
        min: 0,
        max: 1,
        step: 0.01,
        value: triangle.fluid.pressureDissipation,
        callback: value => {
          triangle.fluid.pressureDissipation = value;
        }
      },
      {
        type: "slider",
        name: "Curl",
        min: 0,
        max: 50,
        step: 0.1,
        value: triangle.fluid.curlStrength,
        callback: value => {
          triangle.fluid.curlStrength = value;
        }
      },
      {
        type: "slider",
        name: "Radius",
        min: 0,
        max: 1,
        step: 0.01,
        value: triangle.fluid.radius,
        callback: value => {
          triangle.fluid.radius = value;
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
        callback: value => {
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
        callback: value => {
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
        callback: value => {
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
        callback: value => {
          RenderManager.bloomRadius = value;
          bloomCompositeMaterial.uniforms.uBloomFactors.value = RenderManager.bloomFactors();
        }
      },
      {
        type: "slider",
        name: "Chroma",
        min: 0,
        max: 10,
        step: 0.1,
        value: compositeMaterial.uniforms.uBloomDistortion.value,
        callback: value => {
          compositeMaterial.uniforms.uBloomDistortion.value = value;
        }
      }
    ];

    items.forEach(data => {
      this.ui.addPanel(new PanelItem(data));
    });
  }
}

const BlurDirectionX = new Vector2(1, 0);
const BlurDirectionY = new Vector2(0, 1);

class RenderManager {
  static init(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;

    // Bloom
    this.luminosityThreshold = 0.1;
    this.luminositySmoothing = 1;
    this.bloomStrength = 0.3;
    this.bloomRadius = 0.2;
    this.bloomDistortion = 3;

    this.enabled = true;

    this.initRenderer();
  }

  static initRenderer() {
    const { screenTriangle } = WorldController;

    // Fullscreen triangle
    this.screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    this.screen = new Mesh(screenTriangle);
    this.screen.frustumCulled = false;

    // Render targets
    this.renderTarget = new WebGLRenderTarget(1, 1, {
      depthBuffer: false
    });

    this.renderTargetsHorizontal = [];
    this.renderTargetsVertical = [];
    this.nMips = 5;

    this.renderTargetBright = this.renderTarget.clone();

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.renderTargetsHorizontal.push(this.renderTarget.clone());
      this.renderTargetsVertical.push(this.renderTarget.clone());
    }

    this.renderTarget.depthBuffer = true;

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

    // Composite material
    this.compositeMaterial = new SceneCompositeDistortionMaterial({
      dithering: true
    });
    this.compositeMaterial.uniforms.uBloomDistortion.value = this.bloomDistortion;
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

  static resize = (width, height, dpr) => {
    this.renderer.setPixelRatio(dpr);
    this.renderer.setSize(width, height);

    width = Math.round(width * dpr);
    height = Math.round(height * dpr);

    this.renderTarget.setSize(width, height);

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
      renderer.render(scene, camera);
      return;
    }

    const renderTarget = this.renderTarget;
    const renderTargetBright = this.renderTargetBright;
    const renderTargetsHorizontal = this.renderTargetsHorizontal;
    const renderTargetsVertical = this.renderTargetsVertical;

    // Scene pass
    renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);

    // Extract bright areas
    this.luminosityMaterial.uniforms.tMap.value = renderTarget.texture;
    this.screen.material = this.luminosityMaterial;
    renderer.setRenderTarget(renderTargetBright);
    renderer.render(this.screen, this.screenCamera);

    // Blur all the mips progressively
    let inputRenderTarget = renderTargetBright;

    for (let i = 0, l = this.nMips; i < l; i++) {
      this.screen.material = this.blurMaterials[i];

      this.blurMaterials[i].uniforms.tMap.value = inputRenderTarget.texture;
      this.blurMaterials[i].uniforms.uDirection.value = BlurDirectionX;
      renderer.setRenderTarget(renderTargetsHorizontal[i]);
      renderer.render(this.screen, this.screenCamera);

      this.blurMaterials[i].uniforms.tMap.value = this.renderTargetsHorizontal[i].texture;
      this.blurMaterials[i].uniforms.uDirection.value = BlurDirectionY;
      renderer.setRenderTarget(renderTargetsVertical[i]);
      renderer.render(this.screen, this.screenCamera);

      inputRenderTarget = renderTargetsVertical[i];
    }

    // Composite all the mips
    this.screen.material = this.bloomCompositeMaterial;
    renderer.setRenderTarget(renderTargetsHorizontal[0]);
    renderer.render(this.screen, this.screenCamera);

    // Composite pass (render to screen)
    this.compositeMaterial.uniforms.tScene.value = renderTarget.texture;
    this.compositeMaterial.uniforms.tBloom.value = renderTargetsHorizontal[0].texture;
    this.screen.material = this.compositeMaterial;
    renderer.setRenderTarget(null);
    renderer.render(this.screen, this.screenCamera);
  };
}

class CameraController {
  static init(camera) {
    this.camera = camera;

    this.mouse = new Vector2();
    this.lookAt = new Vector3(0, 0, -2);
    this.origin = new Vector3();
    this.target = new Vector3();
    this.targetXY = new Vector2(5, 1);
    this.origin.copy(this.camera.position);

    this.lerpSpeed = 0.01;
    this.enabled = false;

    this.addListeners();
  }

  static addListeners() {
    window.addEventListener("pointerdown", this.onPointerDown);
    window.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
  }

  // Event handlers

  static onPointerDown = e => {
    this.onPointerMove(e);
  };

  static onPointerMove = ({ clientX, clientY }) => {
    if (!this.enabled) {
      return;
    }

    this.mouse.x = ((clientX / document.documentElement.clientWidth) * 2 - 1) * 0.5;
    this.mouse.y = Math.max(0, 1 - (clientY / document.documentElement.clientHeight) * 2);
  };

  static onPointerUp = e => {
    this.onPointerMove(e);
  };

  // Public methods

  static resize = (width, height) => {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    if (width < height) {
      this.camera.position.z = 14;
    } else {
      this.camera.position.z = 10;
    }

    this.origin.z = this.camera.position.z;

    this.camera.lookAt(this.lookAt);
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
  };

  static animateIn = () => {
    this.enabled = true;
  };
}

class WorldController {
  static init() {
    console.log("got this far");
    this.initWorld();
    this.initLights();
    this.initLoaders();

    this.addListeners();
  }

  static initWorld() {
    const canvas =
      document.getElementById("canvas") ||
      document.body.appendChild(document.createElement("canvas"));

    this.renderer = new WebGLRenderer({
      powerPreference: "high-performance",
      antialias: true,
      canvas: canvas
    });

    console.log(this.renderer);

    // Disable color management
    ColorManagement.enabled = false;
    this.renderer.outputColorSpace = LinearSRGBColorSpace;

    // Output canvas
    this.element = this.renderer.domElement;

    // 3D scene
    this.scene = new Scene();
    this.scene.background = new Color(0x06020b);
    this.scene.fog = new Fog(this.scene.background, 1, 100);
    this.camera = new PerspectiveCamera(30);
    this.camera.near = 0.5;
    this.camera.far = 40;
    this.camera.position.z = 10;
    this.camera.lookAt(this.scene.position);

    // Global geometries
    this.quad = new PlaneGeometry(1, 1);
    this.screenTriangle = getFullscreenTriangle();

    // Global uniforms
    this.resolution = { value: new Vector2() };
    this.texelSize = { value: new Vector2() };
    this.aspect = { value: 1 };
    this.time = { value: 0 };
    this.frame = { value: 0 };
  }

  static initLights() {
    this.scene.add(new HemisphereLight(0x606060, 0x404040, 3));

    const light = new DirectionalLight(0xffffff, 2);
    light.position.set(1, 1, 1);
    this.scene.add(light);
  }

  static initLoaders() {
    this.textureLoader = new TextureLoader();
    console.log("loader: ", SVGLoader);
    this.svgLoader = new SVGLoader();
  }

  static addListeners() {
    this.renderer.domElement.addEventListener("touchstart", this.onTouchStart);
  }

  // Event handlers

  static onTouchStart = e => {
    e.preventDefault();
  };

  // Public methods

  static resize = (width, height, dpr) => {
    width = Math.round(width * dpr);
    height = Math.round(height * dpr);

    this.resolution.value.set(width, height);
    this.texelSize.value.set(1 / width, 1 / height);
    this.aspect.value = width / height;
  };

  static update = (time, delta, frame) => {
    this.time.value = time;
    this.frame.value = frame;
  };

  // Global handlers

  static getTexture = (path, callback) => this.textureLoader.load(path, callback);

  static loadTexture = path => this.textureLoader.loadAsync(path);

  static loadSVG = path => this.svgLoader.loadAsync(path);

  static getFrustum = offsetZ => getFrustum(this.camera, offsetZ);
}

class App {
  constructor() {
    App.init();
  }

  static async init() {
    this.initWorld();
    this.initViews();
    this.initControllers();

    this.addListeners();
    this.onResize();

    await SceneController.ready();

    this.initPanel();

    CameraController.animateIn();
    SceneController.animateIn();
  }

  static initWorld() {
    WorldController.init();
    // document.body.appendChild(WorldController.element);
  }

  static initViews() {
    this.view = new SceneView();
    WorldController.scene.add(this.view);

    this.ui = new UI({ fps: true });
    this.ui.animateIn();
    document.body.appendChild(this.ui.element);
  }

  static initControllers() {
    const { renderer, scene, camera } = WorldController;

    CameraController.init(camera);
    SceneController.init(camera, this.view);
    RenderManager.init(renderer, scene, camera);
  }

  static initPanel() {
    PanelController.init(this.view, this.ui);
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
    const dpr = window.devicePixelRatio * 1.5; // smoover

    WorldController.resize(width, height, dpr);
    CameraController.resize(width, height);
    SceneController.resize(width, height, dpr);
    RenderManager.resize(width, height, dpr);
  };

  static onUpdate = (time, delta, frame) => {
    WorldController.update(time, delta, frame);
    CameraController.update();
    SceneController.update();
    RenderManager.update(time, delta, frame);
    this.ui.update();
  };
}

const _ = () => {
  useEffect(() => {
    new App();
  }, []);

  return <canvas id="canvas" className="fixed top-0 right-0 left-0 bottom-0 w-full h-full" />;
};

export default _;