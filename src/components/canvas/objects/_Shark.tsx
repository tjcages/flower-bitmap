"use client";

import { Point3D } from "@alienkitty/alien.js/all/three";
import { Group, MathUtils, Mesh, MeshStandardMaterial, PerspectiveCamera, Vector3 } from "three";

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

const name = "DiscoShark";

class _ extends Group {
  private camera?: PerspectiveCamera;
  mesh?: Mesh;
  private group?: Group;
  point?: typeof Point3D;

  constructor() {
    super();

    this.position.z = 0.6;
    this.position.y = -1;
    this.scale.multiplyScalar(1);

    this.rotation.x = MathUtils.degToRad(180);
    this.rotation.y = MathUtils.degToRad(0);
    this.rotation.z = MathUtils.degToRad(180);

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
    const { loadGLTF } = WorldController;

    const gltf = await loadGLTF("/objects/shark.glb");
    const model = gltf.scene.children[0] as Mesh;

    console.log(model);

    // Crystal mesh
    const mesh = model.children[0] as Mesh;
    // make material metallic
    mesh.material = new MeshStandardMaterial({
      name: name,
      color: 0xa3a3a3, // light silver
      metalness: 1,
      roughness: 0
    });
    mesh.name = name;

    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.scale.multiplyScalar(0.015);

    // Layers
    mesh.layers.enable(layers.velocity);

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
  }
}

export default _;
