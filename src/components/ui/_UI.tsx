import Image from "next/image";

const _ = () => {
  return (
    <div className="absolute z-10 w-full h-full flex items-end justify-center p-4 md:p-[5vh] text-white uppercase pointer-events-none">
      <Image
        src="/logo.svg"
        alt="totem"
        width={100}
        height={100}
        className="absolute left-8 top-8"
      />
      <div className="flex flex-col items-center justify-center gap-2">
        <h1 className="flex items-center">
          Framework <span className="opacity-50">x</span> Totem
        </h1>
        <h1 className="text-xs text-center max-w-lg">
          Framework x Totem Collab
          <br />
          <br />
          Initial Commitment: 100 DiscoShark Units
          <br />
          Live Spotify Playlists
          <br />
          Unique Event Experiences
          <br />
        </h1>
      </div>
    </div>
  );
};

export default _;
