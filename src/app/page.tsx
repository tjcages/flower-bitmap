import { Canvas } from "@/components";
import { seo } from "@/seo";
import type { Metadata } from "next";

export default async function HomePage() {
  return (
    <div className="fixed inset-0 flex flex-col">
      <Canvas />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return seo;
}
