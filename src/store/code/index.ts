import { Exp } from "@/store/types";

import {
  frag,
  assets as miceAssets,
  content as miceContent,
  index as miceIndex,
  vert
} from "./mice";
import { assets as testAssets, content as testContent, index as testIndex } from "./test";

const _: Exp[] = [
  {
    slug: "test",
    code: [testIndex, testContent],
    assets: testAssets
  },
  {
    slug: "mice",
    code: [miceIndex, miceContent, frag, vert],
    assets: miceAssets
  }
];

export default _;
