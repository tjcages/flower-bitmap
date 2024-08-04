"use client";

import { useLenis } from "@/utils";
import Link from "next/link";
import { useRef } from "react";

interface Props {
  title: string;
}

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

const _ = ({ title }: Props) => {
  const ref = useRef() as React.MutableRefObject<HTMLDivElement>;
  useLenis(ref, undefined, {
    orientation: "horizontal"
  });

  return (
    <div
      ref={ref}
      className="flex flex-col items-start justify-start gap-8 overflow-scroll px-24 py-8"
    >
      <h3 className="sticky left-0">{title}</h3>
      <div className="flex items-center justify-start gap-12">
        {featured.map(f => (
          <Link
            key={f.id}
            href={`/e/${f.slug}`}
            className="group flex flex-col items-start justify-start gap-4"
          >
            <div className="relative aspect-[5/6] w-[25vw] max-w-[500px] flex-shrink-0 overflow-hidden rounded-md border border-black/20 bg-black/10">
              <video
                className="absolute z-10 h-full w-full object-cover"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/assets/featured.mp4" type="video/mp4" />
              </video>
            </div>
            <div className="group flex flex-col items-start justify-start gap-1">
              <h5>{f.title}</h5>
              <p className="opacity-50 transition-opacity duration-100 ease-in group-hover:opacity-100">
                {f.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default _;
