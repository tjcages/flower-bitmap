import Image from "next/image";

const _ = () => {
  return (
    <div className="absolute bottom-0 left-0 right-0 top-0 z-0">
      {/* video with image backup */}
      <video className="absolute z-10 h-full w-full object-cover" autoPlay loop muted playsInline>
        <source src="/assets/featured.mp4" type="video/mp4" />
      </video>
      <Image
        priority
        src="/assets/demo.png"
        alt="featured-image"
        className="absolute h-full w-full object-cover"
        width={3000}
        height={2000}
      />
    </div>
  );
};

export default _;
