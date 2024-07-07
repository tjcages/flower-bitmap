"use client";

import { Reflector } from "@alienkitty/alien.js/all/three";
import dither from "@alienkitty/alien.js/src/shaders/modules/dither/dither.glsl.js";
import {
  Group,
  Mesh,
  NoBlending,
  PlaneGeometry,
  RepeatWrapping,
  Shader,
  ShadowMaterial
} from "three";

import { WorldController } from "@/components/canvas/world";

class _ extends Group {
  private reflector: typeof Reflector;

  constructor() {
    super();

    this.initReflector();
  }

  private initReflector(): void {
    this.reflector = new Reflector({ blurIterations: 8 });
  }

  public async initMesh(): Promise<void> {
    const geometry = new PlaneGeometry(50, 50);

    const { loadTexture } = WorldController;

    const map = await loadTexture("./textures/waterdudv.jpg");
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(5, 3);

    const material = new ShadowMaterial({
      transparent: false,
      blending: NoBlending,
      toneMapped: false
    });

    material.onBeforeCompile = (shader: Shader) => {
      map.updateMatrix();

      shader.uniforms.map = { value: map };
      shader.uniforms.reflectMap = { value: this.reflector.renderTarget.texture };
      shader.uniforms.reflectMapBlur = this.reflector.renderTargetUniform;
      shader.uniforms.uvTransform = { value: map.matrix };
      shader.uniforms.textureMatrix = this.reflector.textureMatrixUniform;

      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        /* glsl */ `
                uniform mat3 uvTransform;
                uniform mat4 textureMatrix;
                out vec2 vUv;
                out vec4 vCoord;

                void main() {
                `
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        /* glsl */ `
                #include <project_vertex>

                vUv = (uvTransform * vec3(uv, 1)).xy;
                vCoord = textureMatrix * vec4(transformed, 1.0);
                `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        /* glsl */ `
                uniform sampler2D map;
                uniform sampler2D reflectMap;
                uniform sampler2D reflectMapBlur;
                in vec2 vUv;
                in vec4 vCoord;

                ${dither}

                void main() {
                `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );",
        /* glsl */ `
                vec2 reflectionUv = vCoord.xy / vCoord.w;

                vec4 dudv = texture(map, vUv);
                vec4 color = texture(reflectMap, reflectionUv);

                vec4 blur;

                blur = texture(reflectMapBlur, reflectionUv + dudv.rg / 256.0);
                color = mix(color, blur, smoothstep(1.0, 0.1, dudv.g));

                blur = texture(reflectMapBlur, reflectionUv);
                color = mix(color, blur, smoothstep(0.5, 1.0, dudv.r));

                gl_FragColor = color * mix(0.3, 0.55, dudv.g);

                gl_FragColor.rgb -= (1.0 - getShadowMask()) * 0.025;

                gl_FragColor.rgb = dither(gl_FragColor.rgb);
                gl_FragColor.a = 1.0;
                `
      );
    };

    const mesh = new Mesh(geometry, material);
    mesh.position.y = -1.05;
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.add(this.reflector);

    mesh.onBeforeRender = (
      renderer: THREE.WebGLRenderer,
      scene: THREE.Scene,
      camera: THREE.Camera
    ) => {
      this.visible = false;
      this.reflector.update(renderer, scene, camera);
      this.visible = true;
    };

    this.add(mesh);
  }

  // Public methods

  public update(): void {}

  public resize(width: number, height: number): void {
    height = 1024;

    this.reflector.setSize(width, height);
  }
}

export default _;
