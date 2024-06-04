"use client";

import dither from "@alienkitty/alien.js/src/shaders/modules/dither/dither.glsl.js";
import rgbshift from "@alienkitty/alien.js/src/shaders/modules/rgbshift/rgbshift.glsl.js";
import smootherstep from "@alienkitty/alien.js/src/shaders/modules/smootherstep/smootherstep.glsl.js";
import rotateUV from "@alienkitty/alien.js/src/shaders/modules/transformUV/rotateUV.glsl.js";
import { GLSL3, NoBlending, RawShaderMaterial, Texture } from "three";

class _ extends RawShaderMaterial {
  uniforms: {
    tScene: { value: Texture | null };
    uFocus: { value: number };
    uRotation: { value: number };
    uBluriness: { value: number };
    uDistortion: { value: number };
  } = {
    tScene: { value: null },
    uFocus: { value: 0.5 },
    uRotation: { value: 0 },
    uBluriness: { value: 1 },
    uDistortion: { value: 10 }
  };
  constructor() {
    super({
      glslVersion: GLSL3,
      uniforms: {
        tScene: { value: null },
        uFocus: { value: 0.5 },
        uRotation: { value: 0 },
        uBluriness: { value: 1 },
        uDistortion: { value: 10 }
      },
      vertexShader: /* glsl */ `
                in vec3 position;
                in vec2 uv;

                out vec2 vUv;

                void main() {
                    vUv = uv;

                    gl_Position = vec4(position, 1.0);
                }
            `,
      fragmentShader: /* glsl */ `
                precision highp float;

                uniform sampler2D tScene;
                uniform float uFocus;
                uniform float uRotation;
                uniform float uBluriness;
                uniform float uDistortion;

                in vec2 vUv;

                out vec4 FragColor;

                ${smootherstep}
                ${rotateUV}
                ${rgbshift}
                ${dither}

                void main() {
                    float d = abs(uFocus - rotateUV(vUv, uRotation).y);
                    float t = smootherstep(0.0, 1.0, d);

                    vec2 dir = 0.5 - vUv;
                    float angle = atan(dir.y, dir.x);
                    float amount = 0.002 * uDistortion * uBluriness * t;

                    FragColor += getRGB(tScene, vUv, angle, amount);

                    FragColor.rgb = dither(FragColor.rgb);
                    FragColor.a = 1.0;
                }
            `,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false
    });
  }
}

export default _;
