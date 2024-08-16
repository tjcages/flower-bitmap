"use client";

import { Base, Geometry, Subtraction } from "@react-three/csg";
import {
  ContactShadows,
  Environment,
  Image,
  MeshTransmissionMaterial,
  OrbitControls
} from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const Blur = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef() as React.MutableRefObject<THREE.Mesh>;
  const squareRef = useRef() as React.MutableRefObject<THREE.Mesh>;

  useFrame(({ clock, viewport, camera, pointer }, delta) => {
    const time = clock.getElapsedTime();
    const { width, height } = viewport.getCurrentViewport(camera, [0, 0, 3]);
    easing.damp3(
      ref.current.position,
      [(pointer.x * width) / 2, (pointer.y * height) / 2, 2],
      0,
      delta
    );
    // fluctuate scale between 1 and 5 over time
    const scale = Math.sin(time) * 2.5 + 3.75;
    easing.damp3(ref.current.scale, scale, 0.5, delta);
    const isArray = Array.isArray(ref.current.material);
    // @ts-expect-error - material is not an array
    easing.dampC(!isArray && ref.current.material.color, "#f0f0f0", 0.1, delta);

    squareRef.current.rotation.z = (Math.sin(time) * Math.PI) / 2 + Math.PI / 2;
  });
  return (
    <>
      <mesh ref={ref}>
        <Geometry>
          <Base>
            <planeGeometry args={[100, 100]} />
          </Base>
          <Subtraction>
            <boxGeometry args={[0.075, 0.075, 0.075]} />
          </Subtraction>
        </Geometry>
        <MeshTransmissionMaterial
          samples={16}
          resolution={512}
          anisotropicBlur={0.1}
          thickness={0.1}
          roughness={0.4}
          toneMapped={true}
          distortion={0.1}
          distortionScale={2}
          temporalDistortion={0}
          transmissionSampler
        />
      </mesh>
      {/* add box ring */}
      <mesh ref={squareRef} position={[0, 0, 2]} scale={0.05}>
        <ringGeometry args={[0.75, 1, 4]} />
        <meshBasicMaterial color="white" />
      </mesh>
      <group>{children}</group>
    </>
  );
};

const ImageRotation = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const images = [
    "/assets/0.jpeg",
    "/assets/1.jpeg",
    "/assets/2.jpeg",
    "/assets/3.jpeg",
    "/assets/4.jpeg",
    "/assets/5.jpeg",
    "/assets/6.jpeg",
    "/assets/7.jpeg",
    "/assets/8.jpeg",
    "/assets/9.jpeg"
  ];
  useEffect(() => {
    // every 2 seconds, change the image
    const interval = setInterval(() => {
      setCurrentImage((currentImage + 1) % images.length);
    }, 500);
    return () => clearInterval(interval);
  }, [currentImage, images.length]);
  return (
    <>
      {/* @ts-expect-error - no alt prop */}
      <Image url={images[currentImage]} alt="image" scale={1.25} />
    </>
  );
};

const _ = () => {
  return (
    <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
      <color attach="background" args={["#141414"]} />
      <ambientLight intensity={0.7} />
      <spotLight intensity={0.5} angle={0.1} penumbra={1} position={[10, 15, -5]} castShadow />
      <Environment preset="city" blur={1} />
      <ContactShadows
        resolution={512}
        position={[0, -0.8, 0]}
        opacity={1}
        scale={10}
        blur={2}
        far={0.8}
      />
      <Blur>
        <ImageRotation />
      </Blur>
      <OrbitControls />
    </Canvas>
  );
};

export default _;
