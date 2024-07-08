"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const _ = () => {
  const [loaded, setLoaded] = useState(false);

  const render = () => {
    console.log("start dynamic import");
    const Main = dynamic(() => import("./_Main"), { ssr: false });
    console.log("end dynamic import");
    return <Main />;
  };

  useEffect(() => {
    console.log("loaded true");
    setLoaded(true);
  }, []);

  console.log("loaded", loaded);

  return loaded ? render() : null;
};

export default _;
