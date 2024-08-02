import code from "@/store/code";
import { notFound } from "next/navigation";

import { Main } from "@/components/editor";

type Props = {
  params: { slug: string };
  searchParams: { r?: string };
};

export default async function Page({ params }: Props) {
  const exp = code.find(exp => exp.slug === params.slug);
  if (!exp) return notFound();

  const { initialFiles, initialAssets } = {
    initialFiles: exp.code,
    initialAssets: exp.assets
  };

  return <Main initialFiles={initialFiles} initialAssets={initialAssets} />;
}
