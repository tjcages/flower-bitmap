import { Asset, File } from "@/store/types";

import { Layout } from "@/components/editor";
import { Loading } from "@/components/shared";

interface Props {
  initialFiles: File[];
  initialAssets: Asset[];
}

const ClientComponent = ({ initialFiles, initialAssets }: Props) => {
  const render = () => {
    if (!initialFiles) return <Loading />;
    return <Layout initialFiles={initialFiles} initialAssets={initialAssets} />;
  };

  return <div>{render()}</div>;
};

const PageComponent = (props: Props) => (
  <main>
    <ClientComponent {...props} />
  </main>
);

export default PageComponent;
