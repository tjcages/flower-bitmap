"use client";

import { useEffect, useState } from "react";

import Main from "./_Main";

const _ = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return loaded ? <Main /> : null;
};

export default _;
