"use client";

import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { Flip } from "gsap/Flip";
import { AsYouType } from "libphonenumber-js";
import { useEffect, useRef, useState } from "react";

import Icon from "@/components/player/_Icon";

gsap.registerPlugin(Flip);
gsap.registerPlugin(Draggable);

interface Props {
  children?: React.ReactNode;
}

const _ = ({ children }: Props) => {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const playerRef = useRef<HTMLDivElement>(null);
  const dragProgress = useRef(0);

  // children
  useEffect(() => {
    const content = document.getElementById("children");
    if (!content) return;
    const state = Flip.getState(content, {
      props: "opacity, filter"
    });

    const contentOpen = "opacity-40 blur-md";
    const contentClosed = "opacity-100 blur-0";

    if (open) {
      content.classList.remove(...contentClosed.split(" "));
      content.classList.add(...contentOpen.split(" "));
    } else {
      content.classList.remove(...contentOpen.split(" "));
      content.classList.add(...contentClosed.split(" "));
    }

    Flip.from(state, {
      duration: 1,
      ease: "expo.inOut"
    });
  }, [open]);

  // player
  useEffect(() => {
    const content = document.getElementById("player");
    if (!content) return;
    const state = Flip.getState(content, {
      props: "padding"
    });

    const contentOpen = "top-0 bottom-auto h-[100px] px-4 py-2";
    const contentClosed = "top-auto bottom-12 p-6";

    if (open) {
      content.classList.remove(...contentClosed.split(" "));
      content.classList.add(...contentOpen.split(" "));

      gsap.to(["#player-duration", "#player-controls"], {
        duration: 0.8,
        opacity: 0,
        filter: "blur(2px)",
        ease: "expo.inOut",
        overwrite: "auto"
      });
    } else {
      content.classList.remove(...contentOpen.split(" "));
      content.classList.add(...contentClosed.split(" "));

      gsap.to(["#player-duration", "#player-controls"], {
        duration: 1,
        opacity: 1,
        filter: "blur(0px)",
        ease: "expo.inOut",
        overwrite: "auto"
      });
    }

    Flip.from(state, {
      duration: 1,
      ease: "expo.inOut"
    });
  }, [open]);

  // account
  useEffect(() => {
    const content = document.getElementById("account");
    if (!content) return;
    const state = Flip.getState(content, {
      props: "padding, borderRadius"
    });

    const contentOpen = "left-0 right-0 top-[116px] bottom-auto h-auto p-4";
    const contentClosed = "bottom-0 w-[160px] h-8 px-3 py-1";

    if (open) {
      content.classList.remove(...contentClosed.split(" "));
      content.classList.add(...contentOpen.split(" "));

      gsap.to(["#account-header"], {
        duration: 0.8,
        opacity: 1,
        ease: "expo.inOut",
        overwrite: "auto",
        onComplete: () => {
          const input = document.getElementById("account-input");
          if (input) input.focus();
        }
      });
    } else {
      content.classList.remove(...contentOpen.split(" "));
      content.classList.add(...contentClosed.split(" "));

      const input = document.getElementById("account-input");
      if (input) input.blur();

      gsap.to(["#account-header"], {
        duration: 0.8,
        opacity: 0.8,
        ease: "expo.inOut",
        overwrite: "auto"
      });
    }

    Flip.from(state, { duration: 1, ease: "expo.inOut" });
  }, [open]);

  useEffect(() => {
    if (playerRef.current) {
      Draggable.create(playerRef.current, {
        type: "y",
        bounds: { minY: -50, maxY: 20 },
        onDrag() {
          const progress = this.y / -50;
          dragProgress.current = progress;
          gsap.set(playerRef.current, { duration: 1, y: this.y, overwrite: false });
        },
        onDragEnd() {
          if (dragProgress.current >= 1) {
            setOpen(true);
            gsap.to(playerRef.current, { duration: 0.5, delay: 1, y: 0, overwrite: true });
          } else {
            setOpen(false);
            gsap.to(playerRef.current, { duration: 0.5, y: 0, overwrite: true });
            gsap.to(playerRef.current, { duration: 0.5, delay: 1, y: 0 });
          }
        }
      });
    }
  }, []);

  return (
    <div
      id="main"
      className="fixed top-0 left-0 right-0 bottom-0 text-white bg-[#04080c] uppercase pointer-events-none overflow-scroll"
    >
      <div
        id="children"
        className="fixed inset-0 noise pointer-events-auto cursor-pointer"
        onClick={() => open && setOpen(false)}
      >
        {children}
      </div>
      <div className="fixed left-4 right-4 bottom-4 top-4 flex flex-col items-center justify-center gap-4 mix-blend-hard-light opacity-90">
        {/* Player */}
        <div
          id="player"
          ref={playerRef}
          className="absolute top-auto bottom-12 w-full p-6 bg-black/90 rounded-2xl outline outline-1 outline-white/20 shadow-2xl shadow-black/80 noise overflow-hidden pointer-events-auto cursor-pointer"
          onClick={() => open && setOpen(false)}
        >
          <div id="player-header" className="flex items-center justify-between">
            <p className="text-red-500">Now Playing</p>
            <p className="opacity-80">12 tracks</p>
          </div>
          <div id="player-track" className="my-3">
            <p className="text-xl contrast-150">Riot (Rowdy Pipe&apos;n)</p>
          </div>
          <div id="player-album" className="my-3">
            <p className="text-lg opacity-80">Don&apos;t Be Dumb</p>
          </div>
          <div
            id="player-duration"
            className="grid grid-cols-[auto_1fr_auto] items-center justify-items-center gap-2"
          >
            <p className="opacity-80">1:12</p>
            <div className="relative w-full h-1.5 bg-white/20 rounded-full overflow-hidden mt-1">
              <div className="absolute top-0 left-0 h-full bg-white rounded-full w-full scale-x-[0.3] origin-left" />
            </div>
            <p className="opacity-80">3:50</p>
          </div>
          <div id="player-controls" className="flex items-center justify-between mt-8">
            <Icon icon="list" className="max-w-[24px] max-h-[24px]" />
            <Icon icon="previous" className="max-w-[20px] max-h-[20px]" />
            <Icon icon="pause" className="max-w-[24px] max-h-[24px]" />
            <Icon icon="next" className="max-w-[20px] max-h-[20px]" />
            <Icon icon="controls" className="max-w-[24px] max-h-[24px]" />
          </div>
        </div>

        {/* Account trigger */}
        <div
          id="account"
          className="absolute bottom-0 flex flex-col justify-start items-start gap-2 px-3 py-1 text-black bg-white/90 rounded-2xl h-8 outline outline-1 outline-white/40 shadow-xl shadow-white/40 overflow-hidden pointer-events-auto cursor-pointer"
          onClick={() => !open && setOpen(true)}
        >
          <div id="account-header" className="flex justify-center items-center gap-2 opacity-80">
            <Icon icon="profile" className="max-w-[16px] max-h-[16px]" />
            <p className="font-medium">Activate Totem</p>
          </div>
          {/* phone number */}
          <div className="flex items-center gap-2 w-full h-12 min-h-[48px] my-2 pl-4 bg-black/10 rounded-full outline outline-1 outline-white/40 overflow-hidden pointer-events-auto">
            <Icon icon="phone" className="max-w-[16px] max-h-[16px] text-black/80" />
            <input
              id="account-input"
              className="relative w-full h-full text-lg bg-transparent placeholder:text-black/80 pointer-events-auto cursor-text"
              placeholder="Enter phone number"
              value={phone}
              onChange={e => setPhone(new AsYouType("US").input(e.target.value))}
              // phone number settings
              maxLength={16}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              type="tel"
            />
          </div>
          <p className="opacity-80 normal-case leading-normal">
            Verify your phone number to associate your totem & activate your account.
          </p>
          <hr className="bg-black/10" />
          {/* send button */}
          <div className="relative z-10 h-full py-1 ml-auto">
            <div className="flex items-center justify-center px-4 py-2 text-black bg-white rounded-full">
              <p className="whitespace-nowrap">Send Code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default _;
