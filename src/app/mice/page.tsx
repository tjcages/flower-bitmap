import { seo } from "@/seo";
import { assets, content, frag, vert } from "@/store/code/mice";
import type { Metadata } from "next";

import Main from "@/components/home/_Main";

type Props = {
  params: unknown;
  searchParams: { r?: string };
};

// make an example api call
async function action() {
  await new Promise(resolve => setTimeout(resolve, 100));
  return {
    initialFiles: [
      {
        name: "index",
        content: `import Content from "./_Content"
  
  const _ = () => {
    return (
      <div className="fixed inset-0 w-full h-full bg-white">
        <Content />
      </div>
    )
  }
  
  export default _;`
      },
      content,
      frag,
      vert
    ],
    initialAssets: assets
  };
}

export default async function HomePage(_: Props) {
  const { initialFiles, initialAssets } = await action();
  return <Main initialFiles={initialFiles} initialAssets={initialAssets} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return seo;
}