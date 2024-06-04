"use client";

import { useEffect, useState } from "react";

const _ = () => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, []);

  return <h1>Fuck you</h1>;
  // return loaded ? <Main /> : null;
};

export default _;
