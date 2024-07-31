"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

const useKeyPress = (
  keys: string | string[],
  callback: (e: { metaKey: boolean; key: string }) => void,
  meta: boolean = false,
  node = null
) => {
  // implement the callback ref pattern
  const callbackRef = useRef(callback);
  useLayoutEffect(() => {
    callbackRef.current = callback;
  });

  // handle what happens on key press
  const handleKeyPress = useCallback(
    (event: { metaKey: boolean; key: string; preventDefault: () => void }) => {
      // check if one of the key is part of the ones we want
      if (meta && event.metaKey === true) {
        if (keys.includes(event.key) || keys.length === 0) {
          event.preventDefault();
          callbackRef.current(event);
        }
      } else if (meta === false || meta === undefined) {
        if (keys.includes(event.key)) {
          event.preventDefault();
          callbackRef.current(event);
        }
      }
    },
    [keys, meta]
  );

  useEffect(() => {
    // target is either the provided node or the document
    const targetNode = node ?? document;
    // attach the event listener
    targetNode && targetNode.addEventListener("keydown", handleKeyPress);

    // remove the event listener
    return () => targetNode && targetNode.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress, node, keys, meta]);
};

export { useKeyPress };
