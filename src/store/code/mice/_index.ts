import { File } from "@/store/types";

const _: File = {
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
};

export default _;
