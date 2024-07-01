import Canvas from "@/components/canvas";

const _ = () => {
  return (
    <main className="fixed z-10 left-0 right-0 bottom-0 top-0 w-full h-full overflow-hidden pointer-events-none">
      <Canvas />
      {/* <UI /> */}
    </main>
  );
};

export default _;
