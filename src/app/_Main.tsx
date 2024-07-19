"use client";

import { state, useSnapshot } from "@/store";
import autoAnimate from "@formkit/auto-animate";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

import { Home } from "@/components/home";
import { Activation, Intro, Unlocks } from "@/components/onboarding";
import { Loading } from "@/components/shared";

// Dynamically import the Canvas component with SSR disabled
const DynamicCanvas = dynamic(() => import("@/components/canvas").then(mod => mod.Canvas), {
  ssr: false,
  loading: () => <Loading />
});

interface Props {
  data: string;
}

const ClientComponent = ({ data }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);
  const { activated, onboarding } = useSnapshot(state);

  useEffect(() => {
    setIsClient(true);
    console.log(data); // test data
  }, [data]);

  const render = () => {
    if (!isClient || !data) {
      return <Loading />;
    }

    if (!activated) {
      switch (onboarding) {
        case "intro":
          return <Intro />;
        case "activation":
          return <Activation />;
        case "unlocks":
          return <Unlocks />;
        default:
          return <Loading />;
      }
    }

    return <Home />;
  };

  // auto animate on add/remove component
  useEffect(() => {
    ref.current &&
      autoAnimate(ref.current, (el, action) => {
        let keyframes: { transform?: string; opacity?: number }[] = [];
        if (action === "add") {
          keyframes = [
            { transform: "translateY(-10px) scale(0.95)", opacity: 0 },
            { transform: "translateY(0px)", opacity: 1 }
          ];
        }
        if (action === "remove") {
          keyframes = [
            { transform: "translateY(0px)", opacity: 1 },
            { transform: "translateY(10px) scale(0.95)", opacity: 0 }
          ];
        }
        return new KeyframeEffect(el, keyframes, { duration: 200, easing: "ease-in" });
      });
  }, []);

  return (
    <div ref={ref}>
      {isClient && <DynamicCanvas />}
      {render()}
    </div>
  );
};

const PageComponent = (props: Props) => (
  <main>
    <ClientComponent {...props} />
  </main>
);

export default PageComponent;
