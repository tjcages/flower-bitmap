"use client";

import autoAnimate from "@formkit/auto-animate";
import { useEffect, useRef, useState } from "react";

import { Home } from "@/components/home";
import { Loading } from "@/components/shared";

interface File {
  name: string;
  content: string;
}

interface Asset {
  name: string;
  src: string;
}

interface Props {
  initialFiles: File[];
  initialAssets: Asset[];
}

const ClientComponent = ({ initialFiles, initialAssets }: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    console.log(initialFiles); // test data
  }, [initialFiles]);

  const render = () => {
    if (!isClient || !initialFiles) {
      return <Loading />;
    }

    return <Home initialFiles={initialFiles} initialAssets={initialAssets} />;
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

  return <div ref={ref}>{render()}</div>;
};

const PageComponent = (props: Props) => (
  <main>
    <ClientComponent {...props} />
  </main>
);

export default PageComponent;
