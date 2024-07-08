"use client";

import { Point3D } from "@alienkitty/alien.js/all/three";
import {
  Color,
  Euler,
  Group,
  IcosahedronGeometry,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  RepeatWrapping,
  TextureLoader,
  Vector2,
  Vector3
} from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";

import { WorldController } from "@/components/canvas/world";

interface Layers {
  default: number;
  velocity: number;
}

interface Params {
  animate: boolean;
  speed: number;
}

const breakpoint: number = 1000;

const layers: Layers = {
  default: 0,
  velocity: 1
};

const params: Params = {
  animate: true,
  speed: 1
};

const name = "Bespoke Audio Player";

class _ extends Group {
  private camera?: PerspectiveCamera;
  mesh?: Mesh;
  logoMesh?: Mesh;
  point?: typeof Point3D;

  constructor() {
    super();

    this.position.x = 2.5;

    // 25 degree tilt like Mars
    this.rotation.y = MathUtils.degToRad(25);
    // this.rotation.z = MathUtils.degToRad(-10);

    this.initCamera();
  }

  private initCamera(): void {
    this.camera = new PerspectiveCamera(30);
    this.camera.near = 0.5;
    this.camera.far = 40;
    this.camera.position.z = 8;
    this.camera.lookAt(this.position.x - 1.4, this.position.y, 0);
    this.camera.zoom = 1.5;
    this.camera.matrixAutoUpdate = false;
  }

  async initMesh(): Promise<void> {
    const { anisotropy, loadTexture, loadEnvironmentTexture } = WorldController;

    const geometry = new IcosahedronGeometry(0.6, 12);

    // Second set of UVs for aoMap and lightMap
    geometry.setAttribute("uv2", geometry.attributes.uv);

    // Textures
    geometry.attributes.uv1 = geometry.attributes.uv;

    // Textures
    const [map, normalMap, ormMap, envMap] = await Promise.all([
      loadTexture("/textures/pbr/pitted_metal_basecolor.jpg"),
      loadTexture("/textures/pbr/pitted_metal_normal.jpg"),
      loadTexture("/textures/pbr/pitted_metal_orm.jpg"),
      loadEnvironmentTexture("/textures/env/jewelry_black_contrast.jpg")
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
      name: name,
      color: new Color(0x8080ff).offsetHSL(0, 0, -0.75),
      metalness: 9,
      roughness: 0.9,
      map,
      metalnessMap: ormMap,
      roughnessMap: ormMap,
      aoMap: ormMap,
      aoMapIntensity: 1,
      normalMap,
      normalScale: new Vector2(3, 3),
      envMap,
      envMapIntensity: 18
    });

    const mesh = new Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;

    // Layers
    mesh.layers.enable(layers.velocity);

    // Load SVG logo texture
    const textureLoader = new TextureLoader();
    const logoTexture = await textureLoader.loadAsync("/framework.svg");

    // Create a decal geometry for the logo
    const decalSize = new Vector3(0.7, 0.6, 0.6); // Adjust size as needed
    const decalPosition = new Vector3(0, 0, 0.4); // Position the decal on the surface of the sphere
    const decalRotation = new Euler(0, 0, 0);

    const decalGeometry = new DecalGeometry(mesh, decalPosition, decalRotation, decalSize);

    const decalMaterial = new MeshStandardMaterial({
      map: logoTexture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const logoMesh = new Mesh(decalGeometry, decalMaterial);
    const logoClone = logoMesh.clone();
    logoClone.rotation.y = Math.PI;

    mesh.add(logoMesh);
    mesh.add(logoClone);
    this.add(mesh);

    this.mesh = mesh;
    this.logoMesh = logoMesh;
  }

  // Public methods

  public resize(width: number, height: number): void {
    if (!this.camera) return;
    this.camera.aspect = width / height;

    if (width < breakpoint) {
      this.camera.lookAt(this.position.x, this.position.y, 0);
      this.camera.zoom = 1;
    } else {
      this.camera.lookAt(this.position.x - 1.4, this.position.y, 0);
      this.camera.zoom = 1.5;
    }

    this.camera.updateProjectionMatrix();
  }

  public update(): void {
    if (!this.mesh) return;
    // Counter clockwise rotation
    this.mesh.rotation.y += 0.0025 * params.speed;
  }
}

export default _;
