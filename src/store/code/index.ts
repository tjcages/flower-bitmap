import { Exp } from "@/store/types";

import {
  frag,
  assets as miceAssets,
  content as miceContent,
  index as miceIndex,
  vert
} from "./mice";
import { assets as testAssets, content as testContent, index as testIndex } from "./test";
import { assets as uniAssets, content as uniContent, index as uniIndex } from "./uni-texture";

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
  },
  {
    slug: "uni-texture",
    code: [uniIndex, uniContent],
    assets: uniAssets
  }
];

export default _;
