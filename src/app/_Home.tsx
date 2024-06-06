"use client";

import { gsap } from "gsap";
import { useEffect, useState } from "react";

import Main from "./_Main";

const _ = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    gsap.delayedCall(0.5, () => setLoaded(true));
  }, []);

  return loaded ? <Main /> : null;
};

export default _;
