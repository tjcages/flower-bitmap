"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const _ = () => {
  const [loaded, setLoaded] = useState(false);

  const render = () => {
    const Main = dynamic(() => import("./_Main"), { ssr: false });
    return <Main />;
  };

  useEffect(() => {
    setLoaded(true);
  }, []);

  return loaded ? render() : null;
};

export default _;
