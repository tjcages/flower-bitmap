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
      width="44"
      height="58"
      viewBox="0 0 44 58"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 9C1.79086 9 0 10.7909 0 13V23C0 25.2091 1.79086 27 4 27H14C16.2091 27 18 25.2091 18 23V13C18 10.7909 16.2091 9 14 9H4ZM4.8418 12.8438C4.28951 12.8438 3.8418 13.2915 3.8418 13.8438V22.1595C3.8418 22.7118 4.28951 23.1595 4.8418 23.1595H13.1576C13.7099 23.1595 14.1576 22.7118 14.1576 22.1595V13.8438C14.1576 13.2915 13.7099 12.8438 13.1576 12.8438H4.8418Z"
        fill="currentColor"
      />
      <path
        d="M6 55C6 56.6569 7.34315 58 9 58C10.6569 58 12 56.6569 12 55V27H6V55Z"
        fill="currentColor"
      />
      <path d="M6 9H12V3C12 1.34315 10.6569 0 9 0C7.34315 0 6 1.34315 6 3V9Z" fill="currentColor" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30 49C27.7909 49 26 47.2091 26 45V35C26 32.7909 27.7909 31 30 31H40C42.2091 31 44 32.7909 44 35V45C44 47.2091 42.2091 49 40 49H30ZM30.8418 45.1562C30.2895 45.1562 29.8418 44.7085 29.8418 44.1562V35.8405C29.8418 35.2882 30.2895 34.8405 30.8418 34.8405H39.1576C39.7099 34.8405 40.1576 35.2882 40.1576 35.8405V44.1562C40.1576 44.7085 39.7099 45.1562 39.1576 45.1562H30.8418Z"
        fill="currentColor"
      />
      <path
        d="M32 3C32 1.34315 33.3431 0 35 0C36.6569 0 38 1.34315 38 3V31H32V3Z"
        fill="currentColor"
      />
      <path
        d="M32 49H38V55C38 56.6569 36.6569 58 35 58C33.3431 58 32 56.6569 32 55V49Z"
        fill="currentColor"
      />
    </svg>
  );
};

export default _;
