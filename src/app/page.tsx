import { seo } from "@/seo";
import type { Metadata } from "next";

import { Carousel, Featured, Header } from "@/components/home";

export default async function HomePage() {
  return (
    <div className="fixed inset-0 flex flex-col">
      <Header />
      <Featured />
      <Carousel />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return seo;
}
