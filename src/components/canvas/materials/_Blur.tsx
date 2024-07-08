"use client";

import {
  GLSL3,
  NearestFilter,
  NoBlending,
  RawShaderMaterial,
  RepeatWrapping,
  Vector2
} from "@alienkitty/alien.js/all/three";
import blur from "@alienkitty/alien.js/src/shaders/modules/blur/blur.glsl.js";
import blueNoise from "@alienkitty/alien.js/src/shaders/modules/noise/blue-noise.glsl.js";
import smootherstep from "@alienkitty/alien.js/src/shaders/modules/smootherstep/smootherstep.glsl.js";
import rotateUV from "@alienkitty/alien.js/src/shaders/modules/transformUV/rotateUV.glsl.js";
import { Texture } from "three";

import { WorldController } from "@/components/canvas/world";

const isDebug = false;

class _ extends RawShaderMaterial {
  uniforms: {
    tMap: { value: Texture | null };
    tBlueNoise: { value: number | null };
    uBlueNoiseResolution: { value: typeof Vector2 };
    uFocus: { value: number };
    uRotation: { value: number };
    uBluriness: { value: number };
    uDirection: { value: typeof Vector2 };
    uDebug: { value: boolean };
    uResolution: { value: typeof Vector2 };
    uTime: { value: number };
  } = {
    tMap: { value: null },
    tBlueNoise: { value: null },
    uBlueNoiseResolution: { value: new Vector2(256, 256) },
    uFocus: { value: 0.25 },
    uRotation: { value: 0 },
    uBluriness: { value: 2 },
    uDirection: { value: new Vector2(0.5, 0.5) },
    uDebug: { value: isDebug },
    uResolution: { value: new Vector2() },
    uTime: { value: 0 }
  };
  constructor(direction = new Vector2(0.5, 0.5)) {
    const { getTexture } = WorldController;

    const texture = getTexture("/textures/blue_noise.png");
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
    texture.magFilter = NearestFilter;
    texture.minFilter = NearestFilter;
    texture.generateMipmaps = false;

    super({
      glslVersion: GLSL3,
      uniforms: {
        tMap: { value: null },
        tBlueNoise: { value: texture },
        uBlueNoiseResolution: { value: new Vector2(256, 256) },
        uFocus: { value: 0.25 },
        uRotation: { value: 0 },
        uBluriness: { value: 2 },
        uDirection: { value: direction },
        uDebug: { value: isDebug },
        uResolution: { value: new Vector2() },
        uTime: { value: 0 }
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

                uniform sampler2D tMap;
                uniform sampler2D tBlueNoise;
                uniform vec2 uBlueNoiseResolution;
                uniform float uFocus;
                uniform float uRotation;
                uniform float uBluriness;
                uniform vec2 uDirection;
                uniform bool uDebug;
                uniform vec2 uResolution;
                uniform float uTime;

                in vec2 vUv;

                out vec4 FragColor;

                vec2 rot2d(vec2 p, float a) {
                    vec2 sc = vec2(sin(a), cos(a));
                    return vec2(dot(p, vec2(sc.y, -sc.x)), dot(p, sc.xy));
                }

                ${smootherstep}
                ${rotateUV}
                ${blur}
                ${blueNoise}

                void main() {
                    float d = abs(uFocus - rotateUV(vUv, uRotation).y);
                    float t = smootherstep(0.0, 1.0, d);
                    float rnd = getBlueNoise(tBlueNoise, gl_FragCoord.xy, uBlueNoiseResolution, vec2(fract(uTime)));

                    FragColor = blur(tMap, vUv, uResolution, 20.0 * uBluriness * t * rot2d(uDirection, rnd));

                    if (uDebug) {
                        FragColor.rgb = mix(FragColor.rgb, mix(FragColor.rgb, vec3(1), 0.5), uBluriness * t);
                    }
                }
            `,
      blending: NoBlending,
      depthTest: false,
      depthWrite: false
    });
  }
}

export default _;
