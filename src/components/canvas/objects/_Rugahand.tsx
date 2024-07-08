"use client";

import { Point3D } from "@alienkitty/alien.js/all/three";
import {
  Color,
  EquirectangularReflectionMapping,
  Group,
  MathUtils,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Vector3
} from "three";

import { WorldController } from "@/components/canvas/world";

const breakpoint = 1000;

const layers = {
  default: 0,
  velocity: 1
};

interface Params {
  animate: boolean;
  speed: number;
}

const params: Params = {
  animate: true,
  speed: 1
};

const name = "Rocky Rugahand";

class _ extends Group {
  private camera?: PerspectiveCamera;
  mesh?: Mesh;
  private group?: Group;
  point?: typeof Point3D;

  constructor() {
    super();

    this.position.y = -1;

    this.rotation.x = MathUtils.degToRad(180);

    this.initCamera();
  }

  private initCamera(): void {
    this.camera = new PerspectiveCamera(30, window.innerWidth / window.innerHeight, 0.5, 40);
    this.camera.position.setZ(8);
    this.camera.lookAt(new Vector3(this.position.x - 1.3, this.position.y, 0));
    this.camera.zoom = 2.5;
    this.camera.updateProjectionMatrix();
  }

  public async initMesh(): Promise<void> {
    const { loadGLTF, loadTexture } = WorldController;

    const gltf = await loadGLTF("/objects/rugahand.glb");
    const model = gltf.scene.children[0] as Mesh;

    const texture = await loadTexture(
      "https://raw.githack.com/pmndrs/drei-assets/456060a26bbeb8fdf79326f224b6d99b8bcce736/hdri/studio_small_03_1k.hdr"
    );
    texture.mapping = EquirectangularReflectionMapping;

    const mesh = model as Mesh;

    // make material color white
    if (mesh.material instanceof Array) {
      mesh.material.forEach(material => {
        if (material instanceof MeshStandardMaterial) {
          material.color = new Color(0xe9e8e4);
          material.metalness = 0.75;
          material.roughness = 1;
        }
      });
    } else {
      if (mesh.material instanceof MeshStandardMaterial) {
        mesh.material.color = new Color(0xe9e8e4);
        mesh.material.metalness = 0.75;
        mesh.material.roughness = 1;
      }
    }

    mesh.name = name;

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.multiplyScalar(0.01);

    // Layers
    mesh.layers.enable(layers.velocity);
    // environment map
    if (mesh.isMesh && mesh.material instanceof MeshStandardMaterial) {
      (mesh.material as MeshStandardMaterial).envMap = texture;
    }

    const group = new Group();
    mesh.rotation.set(Math.PI / 2, 0, 0);
    group.add(mesh);

    this.add(group);

    this.mesh = mesh;
    this.group = group;
  }

  public resize(width: number, height: number): void {
    if (!this.camera) return;
    this.camera.aspect = width / height;

    if (width < breakpoint) {
      this.camera.lookAt(new Vector3(this.position.x, this.position.y, 0));
      this.camera.zoom = 1;
    } else {
      this.camera.lookAt(new Vector3(this.position.x - 1.3, this.position.y, 0));
      this.camera.zoom = 1.5;
    }

    this.camera.updateProjectionMatrix();
  }

  public update(): void {
    if (!params.animate || !this.group) return;

    this.group.rotation.y -= 0.0025 * params.speed;
  }
}

export default _;
