import { Asset } from "./_asset";
import { File } from "./_file";

type Exp = {
  slug: string;
  code: File[];
  assets: Asset[];
};

export type { Exp };
