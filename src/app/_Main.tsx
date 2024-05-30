import Canvas from "@/components/canvas";
import UI from "@/components/ui";

const _ = () => {
  return (
    <main className="fixed left-0 right-0 bottom-0 top-0 w-full h-full bg-black overflow-hidden">
      <Canvas />
      <UI />
    </main>
  );
};

export default _;
