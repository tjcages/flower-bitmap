import { state } from "@/store";
import Image from "next/image";

import { Button } from "@/components/shared";

const _ = () => {
  return (
    <div className="fixed left-0 top-0 right-0 bottom-0">
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-between gap-4 p-8 pt-2 pointer-events-none bg-gradient-to-t from-40% from-black">
        <Image
          src="/icons/logo.png"
          alt="totem logo"
          width={200}
          height={100}
          className="w-auto h-6 opacity-30 blur-[0.5px]"
        />
        <div className="flex flex-col items-center justify-end gap-4 md:gap-8">
          <div className="relative flex flex-col items-center justify-end gap-3">
            <Image
              src="/icons/awge.png"
              alt="awge"
              width={100}
              height={100}
              className="absolute left-0 right-0 bottom-16 -z-10 h-40 w-auto blur-[2px]"
            />
            <h2 className="font-serif">A$AP Rocky</h2>
            <h1 className="text-[80px] leading-[0.9em] font-black text-center mix-blend-difference">
              Don&apos;t
              <br />
              Be
              <br />
              Dumb
            </h1>
          </div>
          <div className="flex flex-col items-center text-center">
            <p>
              Audiophysical: the new music format&nbsp;for&nbsp;superfans
              <br />
              <br />
              Your Totem is here, activate to download premium tracks, playable only with
              this&nbsp;collectible
            </p>
          </div>
          <hr className="max-w-[50%] mx-auto" />
          <Button onClick={() => (state.onboarding = "activation")} icon="fingerprint" size="md">
            Activate Totem
          </Button>
        </div>
      </div>
    </div>
  );
};

export default _;
