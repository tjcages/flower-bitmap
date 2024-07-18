import { cn } from "@/utils";

interface Props {
  id?: string;
  className?: string;
}

const _ = ({ id, className }: Props) => {
  return (
    <svg
      id={id}
      className={cn(className)}
      width="26"
      height="58"
      viewBox="0 0 26 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3 58C1.34315 58 0 56.6569 0 55V3C0 1.34315 1.34315 0 3 0C4.65685 0 6 1.34315 6 3V55C6 56.6569 4.65685 58 3 58Z"
        fill="currentColor"
      />
      <path
        d="M23 58C21.3431 58 20 56.6569 20 55V3C20 1.34315 21.3431 0 23 0C24.6569 0 26 1.34315 26 3V55C26 56.6569 24.6569 58 23 58Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default _;
