import Link from "next/link";

const _ = () => {
  return (
    <div className="absolute left-0 right-0 top-0 z-10 grid grid-cols-3 items-center justify-between justify-items-end gap-8 p-4">
      <Link href="/" className="flex w-full items-center justify-start uppercase">
        <span>D</span>
        <span className="-scale-x-100">epo</span>
        <span>Demos</span>
      </Link>
      <div className="flex gap-4">
        <Link href="/index" className="underline">
          Featured
        </Link>
        <Link href="/index">Index</Link>
        <Link href="/search">Search</Link>
      </div>
      <Link href="/about">About</Link>
    </div>
  );
};

export default _;
