const _ = {
  name: "_Content.tsx",
  content: `import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

import frag from "./_frag";
import vert from "./_vert";

interface AnimatedImage extends THREE.Mesh {
  velocity: THREE.Vector3;
  speed: number;
  updatePosition: () => void;
}

const ImageSpawner: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const imagesRef = useRef<AnimatedImage[]>([]);
  const targetCameraPositionRef = useRef(new THREE.Vector3());
  const textureRef = useRef<THREE.Texture | null>(null);
  const cursorRef = useRef<THREE.Mesh | null>(null);
  const cursorPositionRef = useRef(new THREE.Vector3());

  useEffect(() => {
    if (!canvasRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 10;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current = renderer;

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load("/mouse.png", texture => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      textureRef.current = texture;
      texture.needsUpdate = true;

      createCursor(texture);
    });

    const animate = () => {
      requestAnimationFrame(animate);

      if (cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPositionRef.current, 0.05);
      }

      imagesRef.current.forEach(image => image.updatePosition());

      if (cursorRef.current) {
        cursorRef.current.position.lerp(cursorPositionRef.current, 0.3);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      renderer.dispose();
    };
  }, []);

  const createCursor = (texture: THREE.Texture) => {
    const aspectRatio = texture.image.width / texture.image.height;
    const cursorGeometry = new THREE.PlaneGeometry(0.5 * aspectRatio, 0.5);
    const cursorMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    const cursor = new THREE.Mesh(cursorGeometry, cursorMaterial);
    cursor.renderOrder = 9999;

    if (sceneRef.current) {
      sceneRef.current.add(cursor);
    }

    cursorRef.current = cursor;
  };

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      setMousePosition({ x, y });

      if (cameraRef.current) {
        targetCameraPositionRef.current.set(x * 5, y * 5, cameraRef.current.position.z);

        const vector = new THREE.Vector3(x, y, 0);
        vector.unproject(cameraRef.current);
        cursorPositionRef.current.copy(vector);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.style.cursor = "none";

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.style.cursor = "auto";
    };
  }, []);

  useEffect(() => {
    const spawnImage = () => {
      if (!sceneRef.current || !cameraRef.current || !textureRef.current) return;

      const texture = textureRef.current;
      const aspectRatio = texture.image.width / texture.image.height;
      const geometry = new THREE.PlaneGeometry(0.5 * aspectRatio, 0.5);

      const vertexShader = vert;
      const fragmentShader = frag;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          imageTex: { value: texture },
          speed: { value: 0.0 },
          time: { value: 0.0 }
        },
        vertexShader,
        fragmentShader,
        transparent: true
      });

      const image = new THREE.Mesh(geometry, material) as AnimatedImage;

      image.position.copy(cursorPositionRef.current);

      image.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.05,
        (Math.random() - 0.5) * 0.05,
        0
      );
      image.speed = 0;

      image.updatePosition = () => {
        image.position.add(image.velocity);

        image.speed = image.velocity.length() * 20;
        const material = image.material as THREE.ShaderMaterial;
        material.uniforms.speed.value = image.speed;
        material.uniforms.time.value += 0.01;

        const boundsX = 10;
        const boundsY = 10;
        if (Math.abs(image.position.x) > boundsX) {
          image.velocity.x *= -1;
          image.position.x = Math.sign(image.position.x) * boundsX;
        }
        if (Math.abs(image.position.y) > boundsY) {
          image.velocity.y *= -1;
          image.position.y = Math.sign(image.position.y) * boundsY;
        }

        if (Math.random() < 0.02) {
          image.velocity.set((Math.random() - 0.5) * 0.05, (Math.random() - 0.5) * 0.05, 0);
        }
      };

      sceneRef.current.add(image);
      imagesRef.current.push(image);

      scheduleNextSpawn();
    };

    const scheduleNextSpawn = () => {
      const nextDelay = Math.random() * 100 + 100;
      setTimeout(spawnImage, nextDelay);
    };

    scheduleNextSpawn();

    return () => {
      // Cleanup logic if needed
    };
  }, []);

  return <canvas ref={canvasRef} style={{ width: "100vw", height: "100vh" }} />;
};

export default ImageSpawner;`
};

export default _;
