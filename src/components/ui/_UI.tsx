"use client";

import { gsap } from "gsap";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const _ = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;
    if (pathname === "/") {
      gsap.to(ref.current.children, {
        opacity: 1,
        duration: 1,
        stagger: 0.5,
        ease: "expo.in"
      });
    } else {
      gsap.to(ref.current.children, {
        opacity: 0,
        duration: 0.5,
        ease: "expo.in"
      });
    }
  });

  return (
    <div className="fixed w-full h-full flex items-end justify-start p-4 md:p-[2.5vh] text-white uppercase pointer-events-none">
      <div ref={ref} className="flex flex-col items-start justify-start gap-2">
        <h3 className="fs-3">A$AP ROCKY</h3>
        <h1 className="fs-1">
          DON&apos;T
          <br />
          BE
          <br />
          DUMB
        </h1>
      </div>
      <Image
        src="/logo.svg"
        alt="totem"
        width={100}
        height={100}
        className="absolute left-8 top-8 z-10 w-auto h-8"
      />
    </div>
  );
};

export default _;
