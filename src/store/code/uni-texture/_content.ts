import { File } from "@/store/types";

const _: File = {
  name: "_Content.tsx",
  content: `import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';

interface GridProps {
  squareSize: number;
  gap: number;
  maxRadius: number;
  influenceRadius: number;
  lerpFactor: number;
}

const GridComponent: React.FC<GridProps> = ({ 
  squareSize, 
  gap, 
  maxRadius, 
  influenceRadius,
  lerpFactor 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [mousePosition, setMousePosition] = useState<THREE.Vector2>(new THREE.Vector2(0, 0));
  const prevMousePosition = useRef<THREE.Vector2>(new THREE.Vector2(0, 0));
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  const lerpMousePosition = useCallback(() => {
    if (materialRef.current) {
      const currentMousePos = materialRef.current.uniforms.uMousePosition.value;
      currentMousePos.lerp(mousePosition, lerpFactor);
      prevMousePosition.current.copy(currentMousePos);
    }
  }, [mousePosition, lerpFactor]);

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -size.width / 2, size.width / 2, 
      size.height / 2, -size.height / 2, 
      0.1, 1000
    );
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(size.width, size.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    mountRef.current.appendChild(renderer.domElement);

    const geometry = new THREE.PlaneGeometry(size.width, size.height);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uSquareSize: { value: squareSize },
        uGap: { value: gap },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uMousePosition: { value: new THREE.Vector2(0, 0) },
        uMaxRadius: { value: maxRadius },
        uInfluenceRadius: { value: influenceRadius },
      },
      vertexShader: \`
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      \`,
      fragmentShader: \`
        uniform float uSquareSize;
        uniform float uGap;
        uniform vec2 uResolution;
        uniform vec2 uMousePosition;
        uniform float uMaxRadius;
        uniform float uInfluenceRadius;
        varying vec2 vUv;

        float sdRoundBox(vec2 p, vec2 b, float r) {
          vec2 q = abs(p) - b + vec2(r);
          return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
        }

        float cubicExponential(float x) {
          return 1.0 - pow(1.0 - x, 3.0);
        }

        void main() {
          vec2 position = vUv * uResolution;
          vec2 squareIndex = floor(position / (uSquareSize + uGap));
          vec2 squareCenter = (squareIndex + 0.5) * (uSquareSize + uGap);
          vec2 relativePos = position - squareCenter;

          float distToMouse = distance(squareCenter, uMousePosition);
          float normalizedDist = clamp(distToMouse / uInfluenceRadius, 0.0, 1.0);
          float influence = cubicExponential(1.0 - normalizedDist);
          float radius = uMaxRadius * influence;

          float d = sdRoundBox(relativePos, vec2(uSquareSize * 0.5), radius);

          if (d <= 0.0) {
            gl_FragColor = vec4(1.0, 1.0, 0.9960784314, 1.0); // White square/circle
          } else {
            gl_FragColor = vec4(0.9647058824, 0.0941176471, 0.7254901961, 1.0); // Black gap
          }
        }
      \`,
    });

    materialRef.current = material;

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    camera.position.z = 5;

    const onMouseMove = (event: MouseEvent) => {
      const x = event.clientX;
      const y = size.height - event.clientY; // Invert the y-coordinate
      setMousePosition(new THREE.Vector2(x, y));
    };

    const onResize = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      setSize({ width: newWidth, height: newHeight });
      camera.left = -newWidth / 2;
      camera.right = newWidth / 2;
      camera.top = newHeight / 2;
      camera.bottom = -newHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      material.uniforms.uResolution.value.set(newWidth, newHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    const animate = () => {
      requestAnimationFrame(animate);
      lerpMousePosition();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, [size, squareSize, gap, maxRadius, influenceRadius, lerpMousePosition]);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
};

export default GridComponent;`
};

export default _;
