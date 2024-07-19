import { state } from "@/store";
import { gsap } from "gsap";
import { useEffect, useState } from "react";

import { Scramble } from "@/components/shared";

const _ = () => {
  const [text, set] = useState("Activating...");

  useEffect(() => {
    gsap.to("#activation-bar", {
      scaleX: 1,
      duration: 5,
      delay: 0.5,
      ease: "power2.inOut",
      onComplete: () => {
        set("Done");
        gsap.delayedCall(2, () => {
          state.onboarding = "unlocks";
        });
      }
    });
    gsap.delayedCall(2, () => {
      set("Downloading...");
    });
  }, []);

  return (
    <div className="fixed inset-0 z-10 flex flex-col items-center justify-end gap-4 p-8 pt-2 pointer-events-none bg-gradient-to-t from-40% from-black/50">
      <p>
        <Scramble>{text}</Scramble>
      </p>
      <div className="relative flex items-center justify-center gap-1 pulse">
        <div className="w-1.5 h-4 border-l-2 border-t-2 border-b-2 border-white" />
        <div className="relative w-[200px] h-1 backdrop-blur-md bg-white/10">
          <div
            id="activation-bar"
            className="relative w-full h-full bg-white origin-left scale-x-0"
          />
        </div>
        <div className="w-1.5 h-4 border-r-2 border-t-2 border-b-2 border-white" />
      </div>
    </div>
  );
};

export default _;
