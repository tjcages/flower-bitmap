"use client";

import { useEffect, useState } from "react";

import Canvas from "@/components/canvas";
import UI from "@/components/ui";

const _ = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return (
    <main className="fixed left-0 right-0 bottom-0 top-0 w-full h-full overflow-hidden">
      {loaded && <Canvas />}
      <UI />
    </main>
  );
};

export default _;
