"use client";

import { useLenis } from "@/utils";
import Link from "next/link";
import { useRef } from "react";

const featured = [
  {
    id: 1,
    title: "Hello World",
    description: "A simple Hello World example",
    slug: "hello-world"
  },
  {
    id: 2,
    title: "Hello World",
    description: "A simple Hello World example",
    slug: "hello-world"
  },
  {
    id: 3,
    title: "Hello World",
    description: "A simple Hello World example",
    slug: "hello-world"
  },
  {
    id: 4,
    title: "Hello World",
    description: "A simple Hello World example",
    slug: "hello-world"
  },
  {
    id: 5,
    title: "Hello World",
    description: "A simple Hello World example",
    slug: "hello-world"
  },
  {
    id: 6,
    title: "Hello World",
    description: "A simple Hello World example",
    slug: "hello-world"
  },
  {
    id: 7,
    title: "Hello World",
    description: "A simple Hello World example",
    slug: "hello-world"
  }
];

const _ = () => {
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;
  useLenis(ref, undefined, {
    orientation: "horizontal"
  });

  return (
    <div
      ref={ref}
      className="absolute bottom-0 left-0 right-0 flex flex-col items-start justify-start gap-4 overflow-scroll px-24 py-8"
    >
      <div className="flex items-center justify-start gap-12">
        {featured.map(f => (
          <Link
            key={f.id}
            href={`/e/${f.slug}`}
            className="group flex flex-col items-start justify-start gap-1"
          >
            <div className="aspect-video w-[15vw] max-w-[300px] flex-shrink-0 border border-white/20 bg-white/10"></div>
            <p className="opacity-50 transition-opacity duration-100 ease-in group-hover:opacity-100">
              {f.title}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default _;
