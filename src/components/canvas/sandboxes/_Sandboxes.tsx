import { state } from "@/store";
import { useDevice } from "@/utils";
import { useFrame } from "@react-three/fiber";
import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { useSnapshot } from "valtio";

import "@/utils/_bentPlaneGeometry";

import Content from "./_Content";
import Dashboard from "./_Dashboard";
import Modal from "./_Modal";

interface Props {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

const _ = ({ rotation = [0.02, 0.63, 0.055] }: Props) => {
  const { isMobile, isSafari } = useDevice();
  const ref = useRef() as React.MutableRefObject<THREE.Group>;
  const { selectedStep, sbSelectedModal } = useSnapshot(state);

  useFrame(({ pointer }) => {
    if (ref.current && !isMobile) {
      ref.current.rotation.x = rotation[0] - pointer.y / 400;
      ref.current.rotation.y = rotation[1] + pointer.x / 50;
      ref.current.rotation.z = rotation[2] - pointer.y / 400;
    }
  });

  useEffect(() => {
    if (selectedStep === 2 && state.sbSelectedModal === undefined)
      gsap.delayedCall(1.5, () => (state.sbSelectedModal = 1));
    else if ((selectedStep || 0) < 2) state.sbSelectedModal = undefined;
  }, [selectedStep]);

  return (
    <group ref={ref} rotation={rotation} position={[-2.54, 2.26, -6.18]}>
      <Dashboard visible={selectedStep === 2} modalStep={sbSelectedModal} />

      {/* Isolated sandboxes */}
      <group position={[0, 0, 0]}>
        <Content
          visible={sbSelectedModal === 1}
          url={"/textures/stripe/sandboxes/ui1.png"}
          position={[0, -0.1, isMobile ? 1.5 : 1.25]}
          size={{
            width: 1.8,
            height: 1.33
          }}
        />
        <Modal
          visible={sbSelectedModal === 1}
          title="Isolated sandboxes"
          description="Create multiple, isolated testing environments for staging and development—or for each member of your team."
          position={[
            isMobile ? -0.25 : -0.6,
            isMobile ? 0.25 : isSafari ? -0.6 : -0.2,
            isMobile ? 3 : 2
          ]}
        />
      </group>

      {/* Templates */}
      <group position={[0, 0.15, 0.1]}>
        <Content
          visible={sbSelectedModal === 2}
          url={"/textures/stripe/sandboxes/ui2.png"}
          position={[0, -0.25, isMobile ? 1.5 : 1.25]}
          size={{
            width: 1.8,
            height: 1.35
          }}
        />
        <Modal
          visible={sbSelectedModal === 2}
          title="Templates"
          description="Seed data quickly with templates for common business models."
          position={[isMobile ? 0.15 : 0.75, isMobile ? 0 : isSafari ? 0 : 0.325, isMobile ? 3 : 2]}
        />
      </group>

      {/* Sandbox only access */}
      <group position={[0, 0, 0.2]}>
        <Content
          visible={sbSelectedModal === 3}
          url={"/textures/stripe/sandboxes/ui3.png"}
          position={[isMobile ? -0.65 : -1, isMobile ? 0.3 : 0.5, isMobile ? 1.75 : 1.1]}
          size={{
            width: 0.9,
            height: 0.79 * 0.9
          }}
          scaleGlow={0.5}
        />
        <Modal
          visible={sbSelectedModal === 3}
          title="Locked-down Sandbox access"
          description="Restrict users to Sandboxes, with no access to live business details—perfect for working with external partners."
          position={[
            isMobile ? -0.15 : -0.65,
            isMobile ? 0.19 : isSafari ? -0.4 : -0.165,
            isMobile ? 3 : 2
          ]}
        />
      </group>
    </group>
  );
};

export default _;
