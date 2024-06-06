"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Main = dynamic(() => import("./_Main"), { ssr: false });

const _ = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return loaded ? <Main /> : null;
};

export default _;
