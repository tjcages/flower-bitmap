import { seo } from "@/seo";
import type { Metadata, ResolvingMetadata } from "next";

import Home from "./_Home";

type Props = {
  params: unknown;
  searchParams: { r?: string };
};

export default function HomePage(_: Props) {
  return <Home />;
}

export async function generateMetadata(
  { searchParams }: Props,
  _: ResolvingMetadata
): Promise<Metadata> {
  return seo;
}
