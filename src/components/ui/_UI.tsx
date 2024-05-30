import Image from "next/image";

const _ = () => {
  return (
    <div className="absolute z-10 w-full h-full flex items-end justify-center p-4 md:p-24 text-white uppercase">
      <Image
        src="/logo.svg"
        alt="totem"
        width={100}
        height={100}
        className="absolute left-8 top-8"
      />
      <div className="flex flex-col items-center justify-center gap-4">
        <h1>Framework</h1>
        <p className="blur-[1px] text-xs">
          A$AP Rocky is set to release his highly anticipated album `&quot;Stellar Dreams`&quot;
          this summer, marking his first major project in three years. The album promises to be a
          sonic journey through the rapper&apos;s unique blend of hip-hop, experimental sounds, and
          psychedelic influences.
        </p>
        <button className="mt-4 px-4 py-1 text-sm text-center text-black bg-white">
          Confidential – Enter
        </button>
      </div>
    </div>
  );
};

export default _;
