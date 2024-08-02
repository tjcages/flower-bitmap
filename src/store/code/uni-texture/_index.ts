import { File } from "@/store/types";

const _: File = {
  name: "index",
  content: `import Content from "./_Content"

const _ = () => {
  return (
    <div className="fixed inset-0 w-full h-full bg-[#f519b9]">
      <Content 
        width={800} 
        height={600} 
        squareSize={25} 
        gap={1}
        maxRadius={12.5}
        influenceRadius={200}
        lerpFactor={0.05}  // Controls the smoothness of the mouse movement (0-1)
    />
    </div>
  )
}

export default _;`
};

export default _;
