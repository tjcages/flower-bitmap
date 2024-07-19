import { state } from "@/store";
import autoAnimate from "@formkit/auto-animate";
import { useCallback, useEffect, useRef, useState } from "react";

import { Scramble } from "@/components/shared";

const tracklist = [
  { id: 1, title: "Sights by A$AP Rocky & Playboi Carti", artist: "A$AP Rocky & Playboi Carti" },
  { id: 2, title: "Goin' Dumb* (Ft. Tommy Revenge)", artist: "A$AP Rocky" },
  { id: 3, title: "Tailor Swif", artist: "A$AP Rocky" },
  { id: 4, title: "THIS IS THE WAY THE WORLD ENDS (Ft. A$AP NAST)", artist: "A$AP Rocky" },
  { id: 5, title: "RIOT (Rowdy Pipe'n) (Ft. Pharrell Williams)", artist: "A$AP Rocky" },
  { id: 6, title: "All Black*", artist: "A$AP Rocky" },
  { id: 7, title: "D.M.B.", artist: "A$AP Rocky" },
  { id: 8, title: "GO! (Ft. Playboi Carti)", artist: "A$AP Rocky" },
  { id: 9, title: "Same Problems?", artist: "A$AP Rocky" },
  { id: 10, title: "Mushroom Clouds", artist: "A$AP Rocky" },
  { id: 11, title: "Shittin' Me", artist: "A$AP Rocky" },
  { id: 12, title: "GRIM FREESTYLE", artist: "A$AP Rocky" }
];

const _ = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, set] = useState(0);

  // redo animateTracks function with the countdown progressively going from 1000 to 200
  const animateTracks = useCallback(() => {
    const timeout = setTimeout(
      () => {
        set(x => {
          if (x < tracklist.length) return x + 1;
          if (timeout) clearTimeout(timeout);
          setTimeout(() => (state.activated = true), 1000);
          return x;
        });
      },
      100 + (shown / tracklist.length) ** 2 * 600
    );
  }, [shown]);

  // auto animate on add/remove component
  useEffect(() => {
    ref.current && autoAnimate(ref.current);
    animateTracks();
  }, [animateTracks]);

  return (
    <div className="fixed left-0 right-0 top-0 bottom-0 z-10 flex flex-col items-center justify-between gap-4 bg-gradient-to-t from-40% from-black to-black/50 pointer-events-auto">
      <div className="fixed left-0 top-0 right-0 flex flex-col items-center justify-center py-4 bg-gradient-to-t from-black/50 to-black backdrop-blur-xl">
        <p>
          <Scramble>Downloaded Tracks</Scramble>
        </p>
      </div>
      <div className="flex flex-col items-center justify-center gap-1 mt-[10vh] p-8 max-w-full bg-gradient-to-t from-black">
        <h2 className="font-serif">A$AP Rocky</h2>
        <h1 className="text-5xl tracking-tighter text-center font-black">
          Don&apos;t&nbsp;Be&nbsp;Dumb
        </h1>
        <div ref={ref} className="flex flex-col gap-4 mt-8 w-full">
          {tracklist.slice(tracklist.length - shown, tracklist.length).map(track => (
            <div key={track.id} className="flex flex-col gap-2 w-full">
              <div className="flex gap-1 w-full">
                <h4>{track.id}.</h4>
                <div className="flex flex-col gap-1 w-full">
                  <h4>{track.title}</h4>
                  <p className="text-base">{track.artist}</p>
                </div>
              </div>
              <hr className="my-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default _;
