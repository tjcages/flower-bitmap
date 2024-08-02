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
        "pointer-events-auto flex min-h-[44px] w-full items-center justify-center gap-1 whitespace-nowrap rounded-full py-2 pl-3 pr-4 font-medium uppercase tracking-tight",
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
            size === "sm" && "h-4 max-h-[16px] w-4 max-w-[16px]",
            size === "md" && "h-5 max-h-[20px] w-5 max-w-[20px]",
            size === "lg" && "h-8 max-h-[32px] w-8 max-w-[32px]",
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
