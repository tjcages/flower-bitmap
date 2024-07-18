import Player from "@/components/player";

const _ = () => {
  return (
    <main className="fixed z-10 w-full h-full overflow-hidden">
      <Player>
        {/* <Canvas /> */}
        <div className="grid grid-rows-[1fr_200px] w-full h-full">
          <video
            autoPlay
            playsInline
            loop
            muted
            className="w-full h-full object-cover gradient-mask-b-10"
          >
            <source src="/example.mov" type="video/mp4" />
          </video>
          <video
            autoPlay
            playsInline
            loop
            muted
            className="w-full h-full object-cover -scale-y-100 blur-lg gradient-mask-b-10"
          >
            <source src="/example.mov" type="video/mp4" />
          </video>
        </div>
      </Player>
    </main>
  );
};

export default _;
