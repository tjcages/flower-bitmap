import { File } from "@/store/types";

const _: File = {
  name: "_vert.ts",
  content: `
  const _ = \`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
\`

export default _;
`
};

export default _;
