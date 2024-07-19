import { seo } from "@/seo";
import type { Metadata } from "next";

import Main from "./_Main";

type Props = {
  params: unknown;
  searchParams: { r?: string };
};

// make an example api call
async function action() {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return { data: "Hello, world!" };
}

export default async function HomePage(_: Props) {
  const { data } = await action();
  return <Main data={data} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return seo;
}
