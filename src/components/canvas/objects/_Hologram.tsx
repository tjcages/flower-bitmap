"use client";

import fresnel from "@alienkitty/alien.js/src/shaders/modules/fresnel/fresnel.glsl.js";
import {
  Color,
  EdgesGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshStandardMaterial,
  RepeatWrapping,
  Vector2
} from "three";

import { WorldController } from "@/components/canvas/world";

const colors = {
  iceColor: 0x547691,
  lightColor: 0x00ffff,
  errorColor: 0xff0000
};

const layers = {
  default: 0,
  hologram: 1,
  glow: 2
};

class _ extends Group {
  uniforms: { fresnelColor: { value: Color }; fresnelPower: { value: number } };

  constructor() {
    super();

    this.uniforms = {
      fresnelColor: { value: new Color(colors.lightColor).offsetHSL(0, 0, 0.25) },
      fresnelPower: { value: 1.5 }
    };

    this.position.x = 0;
  }

  async initMesh() {
    const { anisotropy, loadTexture, loadGLTF } = WorldController;

    const gltf = await loadGLTF("/objects/awge.glb");
    const model = gltf.scene.children[0] as Mesh;
    const mesh = model as Mesh;

    // create a new uv
    mesh.geometry.attributes.uv = mesh.geometry.attributes.position;
    mesh.geometry.attributes.uv1 = mesh.geometry.attributes.uv;

    // const geometry = new SphereGeometry(2, 80, 80);
    // geometry.attributes.uv1 = geometry.attributes.uv;

    // Textures
    const [map, normalMap, ormMap] = await Promise.all([
      loadTexture("/textures/pbr/pitted_metal_basecolor.jpg"),
      loadTexture("/textures/pbr/pitted_metal_normal.jpg"),
      loadTexture("/textures/pbr/pitted_metal_orm.jpg")
    ]);

    map.anisotropy = anisotropy;
    map.wrapS = RepeatWrapping;
    map.wrapT = RepeatWrapping;
    map.repeat.set(2, 1);

    normalMap.anisotropy = anisotropy;
    normalMap.wrapS = RepeatWrapping;
    normalMap.wrapT = RepeatWrapping;
    normalMap.repeat.set(2, 1);

    ormMap.anisotropy = anisotropy;
    ormMap.wrapS = RepeatWrapping;
    ormMap.wrapT = RepeatWrapping;
    ormMap.repeat.set(2, 1);

    const material = new MeshStandardMaterial({
      color: new Color(),
      metalness: 1,
      roughness: 1,
      map,
      metalnessMap: ormMap,
      roughnessMap: ormMap,
      aoMap: ormMap,
      aoMapIntensity: 1,
      normalMap,
      normalScale: new Vector2(1, 1),
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    // Second channel for aoMap and lightMap
    // https://threejs.org/docs/#api/en/materials/MeshStandardMaterial.aoMap
    if (material.aoMap) material.aoMap.channel = 1;

    mesh.material = material;
    // const mesh = new Mesh(geometry, material);
    mesh.layers.set(layers.hologram);
    this.add(mesh);

    // Hologram
    const glowMaterial = material.clone();
    glowMaterial.color = new Color(colors.lightColor);
    glowMaterial.emissive = new Color(colors.lightColor);
    glowMaterial.emissiveIntensity = 0.125;

    const uniforms = {
      fresnelColor: { value: new Color(colors.lightColor).offsetHSL(0, 0, 0.25) },
      fresnelPower: { value: 1.5 }
    };

    glowMaterial.onBeforeCompile = shader => {
      shader.uniforms = Object.assign(shader.uniforms, uniforms);

      shader.vertexShader = shader.vertexShader.replace(
        "void main() {",
        /* glsl */ `
              out vec3 vWorldNormal;
              out vec3 vViewDirection;

              void main() {
              `
      );

      shader.vertexShader = shader.vertexShader.replace(
        "#include <project_vertex>",
        /* glsl */ `
              #include <project_vertex>

              vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
              vViewDirection = normalize(cameraPosition - (modelMatrix * vec4(transformed, 1.0)).xyz);
              `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "void main() {",
        /* glsl */ `
              uniform vec3 fresnelColor;
              uniform float fresnelPower;

              in vec3 vWorldNormal;
              in vec3 vViewDirection;

              ${fresnel}

              void main() {
              `
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        "vec3 totalEmissiveRadiance = emissive;",
        /* glsl */ `
              vec3 totalEmissiveRadiance = emissive;

              float fresnel = getFresnel(vViewDirection, vWorldNormal, fresnelPower);
              totalEmissiveRadiance += (fresnel * fresnelColor) * 0.2;
              `
      );
    };

    mesh.position.set(0, 0, 0);

    const glowMesh = new Mesh(mesh.geometry, glowMaterial);
    glowMesh.position.copy(mesh.position);
    glowMesh.scale.copy(mesh.scale);
    glowMesh.layers.set(layers.glow);
    this.add(glowMesh);

    // Wireframe
    const wireframe = new LineSegments(
      new EdgesGeometry(mesh.geometry),
      new LineBasicMaterial({ color: new Color(colors.lightColor).offsetHSL(0, 0, 0.25) })
    );
    wireframe.position.copy(mesh.position);
    wireframe.scale.copy(mesh.scale);
    wireframe.layers.set(layers.hologram);
    glowMesh.add(wireframe);

    this.uniforms = uniforms;

    this.add(mesh, glowMesh, wireframe);
  }

  public resize(width: number, height: number): void {}
  public update(): void {}
}

export default _;
