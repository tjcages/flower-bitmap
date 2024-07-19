import { cn } from "@/utils";

import { Icon, Scramble } from "@/components/shared";

interface Props {
  children?: React.ReactNode;
  className?: string;
  icon?:
    | "controls"
    | "next"
    | "pause"
    | "play"
    | "previous"
    | "list"
    | "profile"
    | "phone"
    | "send"
    | "lock"
    | "fingerprint";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onClick?: () => void;
}

const _ = ({ children, className, icon, size, disabled, onClick }: Props) => {
  return (
    <button
      className={cn(
        "flex items-center justify-center w-full min-h-[44px] gap-1 pl-3 pr-4 py-2 rounded-full font-medium uppercase tracking-tight whitespace-nowrap pointer-events-auto",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-lg",
        className
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {icon !== undefined && (
        <Icon
          icon={icon}
          className={cn(
            size === "sm" && "w-4 max-w-[16px] h-4 max-h-[16px]",
            size === "md" && "w-5 max-w-[20px] h-5 max-h-[20px]",
            size === "lg" && "w-8 max-w-[32px] h-8 max-h-[32px]",
            "text-inherit"
          )}
        />
      )}
      {/* if type is string, render as ScrambleText */}
      {typeof children === "string" && (
        <p className="text-inherit">
          <Scramble>{children}</Scramble>
        </p>
      )}
      {/* if type is ReactNode, render as children */}
      {typeof children === "object" && children}
    </button>
  );
};

export default _;
