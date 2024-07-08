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
  Vector2,
  Vector3,
  VideoTexture
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

type Props = {
  position?: { x?: number; y?: number; z?: number };
  rotation?: { x?: number; y?: number; z?: number };
  scale?: { x?: number; y?: number; z?: number };
};

const name = "Bespoke Audio Player";

class _ extends Group {
  private camera?: PerspectiveCamera;
  mesh?: Mesh;
  point?: typeof Point3D;

  constructor({
    position = { x: 0, y: 0, z: 0.2 },
    rotation = { x: 90, y: 0, z: 0 },
    scale = {
      x: 1,
      y: 1,
      z: 1
    }
  }: Props) {
    super();

    this.position.x = position.x || 0;
    this.position.y = position.y || 0;
    this.position.z = position.z || 0;

    this.rotation.x = MathUtils.degToRad(rotation.x || 0);
    this.rotation.y = MathUtils.degToRad(rotation.y || 0);
    this.rotation.z = MathUtils.degToRad(rotation.z || 0);

    this.scale.x = scale.x || 1;
    this.scale.y = scale.y || 1;
    this.scale.z = scale.z || 1;

    this.initCamera();
  }

  private initCamera(): void {
    this.camera = new PerspectiveCamera(30);
    this.camera.near = 0.5;
    this.camera.far = 40;
    this.camera.position.z = 2;
    this.camera.lookAt(this.position.x - 1.2, this.position.y, 0);
    this.camera.zoom = 1.5;
    this.camera.matrixAutoUpdate = false;
  }

  public async initMesh(): Promise<void> {
    const { anisotropy, loadTexture } = WorldController;

    const geometry = new BoxGeometry(1.35, 0.05, 1.35);

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
      color: new Color("#111111"),
      metalness: 0.6,
      roughness: 0.9,
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
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = name;

    // Layers
    mesh.layers.enable(layers.velocity);

    this.mesh = mesh;

    // Decals
    this.renderDecal(
      "/example.mov", // Change this to your video file path
      new Vector3(0, 0.2, 0),
      new Vector3(1.3, 1.3, 1),
      new Euler(MathUtils.degToRad(-90), 0, 0),
      false
    );

    mesh.scale.multiplyScalar(1.1);
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

    // Create video element
    const video = document.createElement("video");
    video.src = url;
    video.load();
    video.loop = true;
    video.playsInline = true;
    video.muted = true;
    video.play();

    // Create VideoTexture
    const videoTexture = new VideoTexture(video);

    // Create a decal geometry for the video
    const decalSize = scale || new Vector3(0.5, 0.5, 0.5); // Adjust size as needed
    const decalPosition = position || new Vector3(0, 0, 0.6); // Position the decal on the surface of the box
    const decalRotation = rotation || new Euler(0, 0, 0);

    const decalGeometry = new DecalGeometry(this.mesh, decalPosition, decalRotation, decalSize);

    const decalMaterial = new MeshStandardMaterial({
      map: videoTexture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });

    const videoMesh = new Mesh(decalGeometry, decalMaterial);
    this.mesh.add(videoMesh);

    if (bothSides) {
      const videoClone = videoMesh.clone();
      videoClone.rotation.y = Math.PI;

      this.mesh.add(videoClone);
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
    // rotate between -45 & 45 degrees

    // this.mesh.rotation.x -= Math.sin(Date.now() * 0.001) * 0.0025 * params.speed;
  }
}

export default _;
