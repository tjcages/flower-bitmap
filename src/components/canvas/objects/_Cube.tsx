"use client";

import { Point3D } from "@alienkitty/alien.js/all/three";
import {
  BoxGeometry,
  Color,
  Euler,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  TextureLoader,
  Vector2,
  Vector3
} from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";

import { WorldController } from "@/components/canvas/world";

const breakpoint = 1000;

const layers = {
  default: 0,
  velocity: 1
};

const params = {
  animate: true,
  speed: 1
};

const name = "Branded Packaging";

class _ extends Group {
  private camera?: PerspectiveCamera;
  mesh?: Mesh;
  point?: typeof Point3D;

  constructor() {
    super();

    this.position.x = -2.5;
    this.position.z = 0.2;

    this.initCamera();
  }

  private initCamera(): void {
    this.camera = new PerspectiveCamera(30);
    this.camera.near = 0.5;
    this.camera.far = 40;
    this.camera.position.z = 8;
    this.camera.lookAt(this.position.x - 1.2, this.position.y, 0);
    this.camera.zoom = 1.5;
    this.camera.matrixAutoUpdate = false;
  }

  public async initMesh(): Promise<void> {
    const { anisotropy, loadTexture } = WorldController;

    const geometry = new BoxGeometry(1, 1, 1.35);

    // Second set of UVs for aoMap and lightMap
    geometry.setAttribute("uv2", geometry.attributes.uv);

    // Textures
    const [map, normalMap, ormMap] = await Promise.all([
      loadTexture("/textures/pbr/pitted_metal_basecolor.jpg"),
      loadTexture("/textures/pbr/pitted_metal_normal.jpg"),
      loadTexture("/textures/pbr/pitted_metal_orm.jpg")
    ]);

    map.anisotropy = anisotropy;
    normalMap.anisotropy = anisotropy;
    ormMap.anisotropy = anisotropy;

    const material = new MeshStandardMaterial({
      name: name,
      color: new Color().offsetHSL(0, 0, -0.85),
      metalness: 0.8,
      roughness: 0.5,
      map,
      metalnessMap: ormMap,
      roughnessMap: ormMap,
      aoMap: ormMap,
      aoMapIntensity: 1,
      normalMap,
      normalScale: new Vector2(1, 1),
      flatShading: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1
    });

    const mesh = new Mesh(geometry, material);
    mesh.rotation.x = MathUtils.degToRad(-45);
    mesh.rotation.z = MathUtils.degToRad(-45);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;

    // Layers
    mesh.layers.enable(layers.velocity);

    this.mesh = mesh;

    // Decals
    this.renderDecal(
      "/framework-liquid.svg",
      new Vector3(0.7, 0, 0),
      new Vector3(0.5, 0.5, 0.5),
      new Euler(0, MathUtils.degToRad(-90), MathUtils.degToRad(-90)),
      true
    );
    this.renderDecal(
      "/discoshark.svg",
      new Vector3(0, 0.7, 0),
      new Vector3(0.5, 1, 0.5),
      new Euler(MathUtils.degToRad(-90), 0, 0),
      false
    );
    this.renderDecal(
      "/totem.svg",
      new Vector3(0, 0, -0.7),
      new Vector3(0.5, 0.25, 0.5),
      new Euler(0, Math.PI, 0),
      false
    );
    this.renderDecal(
      "/disclaimer.svg",
      new Vector3(0, 0, 0.7),
      new Vector3(0.7, 0.6, 0.7),
      new Euler(0, 0, 0),
      false
    );
    this.renderDecal(
      "/bottom.svg",
      new Vector3(0, -1, 0),
      new Vector3(1, 1.35, 1),
      new Euler(MathUtils.degToRad(90), 0, 0),
      false
    );

    this.add(mesh);
  }

  renderDecal(
    url: string,
    position?: Vector3,
    scale?: Vector3,
    rotation?: Euler,
    bothSides?: boolean
  ): void {
    if (!this.mesh) return;

    // Load SVG logo texture
    const textureLoader = new TextureLoader();
    const logoTexture = textureLoader.load(url);

    // Create a decal geometry for the logo
    const decalSize = scale || new Vector3(0.5, 0.5, 0.5); // Adjust size as needed
    const decalPosition = position || new Vector3(0, 0, 0.6); // Position the decal on the surface of the box
    const decalRotation = rotation || new Euler(0, 0, 0);

    const decalGeometry = new DecalGeometry(this.mesh, decalPosition, decalRotation, decalSize);

    const decalMaterial = new MeshStandardMaterial({
      map: logoTexture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const logoMesh = new Mesh(decalGeometry, decalMaterial);
    this.mesh.add(logoMesh);

    if (bothSides) {
      const logoClone = logoMesh.clone();
      logoClone.rotation.y = Math.PI;

      this.mesh.add(logoClone);
    }
  }

  // Public methods

  public resize(width: number, height: number): void {
    if (!this.camera) return;
    this.camera.aspect = width / height;

    if (width < breakpoint) {
      this.camera.lookAt(this.position.x, this.position.y, 0);
      this.camera.zoom = 1;
    } else {
      this.camera.lookAt(this.position.x - 1.2, this.position.y, 0);
      this.camera.zoom = 1.5;
    }

    this.camera.updateProjectionMatrix();
  }

  public update(): void {
    if (!params.animate || !this.mesh) return;
    this.mesh.rotation.y -= 0.0025 * params.speed;
  }
}

export default _;
